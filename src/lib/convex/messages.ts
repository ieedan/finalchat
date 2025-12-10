import { v } from 'convex/values';
import { httpAction, internalAction, internalQuery, query } from './_generated/server';
import { mutation, internalMutation } from './functions';
import { components, internal } from './_generated/api';
import {
	PersistentTextStreaming,
	StreamId,
	StreamIdValidator
} from '@convex-dev/persistent-text-streaming';
import { Id } from './_generated/dataModel';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText, AISDKError } from 'ai';
import {
	getChatMessagesInternal,
	getLastUserAndAssistantMessages,
	MessageWithAttachments
} from './chat.utils';
import { TITLE_GENERATION_MODEL } from '../ai.js';
import { appendChunk } from '../utils/reasoning-custom-protocol';

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming);

export const Prompt = v.object({
	modelId: v.string(),
	input: v.string(),
	attachments: v.optional(
		v.array(
			v.object({
				url: v.string(),
				key: v.string()
			})
		)
	)
});

export const create = mutation({
	args: {
		chatId: v.optional(v.id('chat')),
		prompt: Prompt,
		apiKey: v.string()
	},
	handler: async (
		ctx,
		args
	): Promise<{
		chatId: Id<'chat'>;
		userMessageId: Id<'messages'>;
		assistantMessageId: Id<'messages'>;
	}> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		let chatId: Id<'chat'>;
		if (!args.chatId) {
			chatId = await ctx.db.insert('chat', {
				userId: user.subject,
				title: 'Untitled Chat',
				generating: false,
				updatedAt: Date.now(),
				pinned: false
			});

			ctx.scheduler.runAfter(0, internal.messages.generateChatTitle, {
				chatId,
				apiKey: args.apiKey
			});
		} else {
			chatId = args.chatId;
			await ctx.db.patch(chatId, {
				updatedAt: Date.now()
			});
		}

		const userMessageId = await ctx.db.insert('messages', {
			chatId,
			role: 'user',
			content: args.prompt.input,
			chatSettings: {
				modelId: args.prompt.modelId
			}
		});

		if (args.prompt.attachments && args.prompt.attachments?.length > 0) {
			// relate the attachments to the user message
			await Promise.all(
				args.prompt.attachments.map(async (attachment) => {
					await ctx.runMutation(internal.chatAttachments.create, {
						chatId,
						messageId: userMessageId,
						key: attachment.key,
						userId: user.subject
					});
				})
			);
		}

		const streamId = await persistentTextStreaming.createStream(ctx);
		const assistantMessageId = await ctx.db.insert('messages', {
			chatId,
			role: 'assistant',
			streamId,
			meta: {
				modelId: args.prompt.modelId
			}
		});

		return {
			chatId,
			assistantMessageId,
			userMessageId
		};
	}
});

export const getChatBody = query({
	args: {
		streamId: StreamIdValidator
	},
	handler: async (ctx, args) => {
		return await persistentTextStreaming.getStreamBody(ctx, args.streamId as StreamId);
	}
});

export const generateChatTitle = internalAction({
	args: {
		chatId: v.id('chat'),
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		const chat = await ctx.runQuery(internal.chat.internalGet, { chatId: args.chatId });
		if (!chat) throw new Error('Chat not found');

		if (chat.generatingTitle) return;

		await ctx.runMutation(internal.chat.updateGenerating, {
			chatId: args.chatId,
			generating: true
		});

		try {
			const openrouter = createOpenRouter({
				apiKey: args.apiKey
			});

			const { text } = await generateText({
				model: openrouter.chat(TITLE_GENERATION_MODEL),
				prompt: `Generate a title for the following chat. The title should be a short summary, no more than 7 words, ideally as few as possible as the title will be displayed in cramped spaces.

			DO NOT USE MARKDOWN FOR THE TITLE.

			Simple conversations can easily be summarized in one word. For instance if the user was to say: "Hello", "greeting" would be a sufficient title.

			<chat>
			${chat.messages
				.map(
					(message) => `<message role="${message.role}">
				${message.content}
			</message>`
				)
				.join('\n')}
			</chat>`
			});

			await ctx.runMutation(internal.chat.updateGeneratedTitle, {
				chatId: args.chatId,
				title: text
			});
		} catch (error) {
			console.error(error);
			await ctx.runMutation(internal.chat.updateGenerating, {
				chatId: args.chatId,
				generating: false
			});
		}
	}
});

export const streamMessage = httpAction(async (ctx, request) => {
	const { streamId, chatId, apiKey } = (await request.json()) as {
		streamId: StreamId;
		chatId: Id<'chat'>;
		apiKey: string | undefined;
	};

	const response = await persistentTextStreaming.stream(
		ctx,
		request,
		streamId,
		async (ctx, _request, _streamId, append) => {
			let last: ReturnType<typeof getLastUserAndAssistantMessages> | null = null;
			try {
				const messages = await ctx.runQuery(internal.messages.getMessagesForChat, { chatId });

				last = getLastUserAndAssistantMessages(messages);
				if (!last) {
					throw new Error('There was a problem getting the previous messages');
				}

				// remove the assistant message so it's not part of the generation
				messages.pop();

				await ctx.runMutation(internal.messages.startGenerating, {
					messageId: last.assistantMessage._id
				});

				const openrouter = createOpenRouter({
					apiKey
				});

				const { fullStream, totalUsage } = streamText({
					model: openrouter.chat(last.userMessage.chatSettings.modelId),
					messages: messages.map((message) => {
						if (message.role === 'assistant') {
							return {
								role: message.role,
								content: message.content ?? ''
							};
						}

						const imageParts = message.attachments?.map(
							(attachment) =>
								({
									type: 'image',
									image: attachment.url
								}) as const
						);

						return {
							role: message.role,
							content: [
								{
									type: 'text',
									text: message.content ?? ''
								},
								...(imageParts ?? [])
							]
						};
					}),
					onError: ({ error }) => {
						throw new AISDKError({
							name: error instanceof Error ? error.name : 'UnknownError',
							message: error instanceof Error ? error.message : 'Unknown error',
							cause: error instanceof Error ? error : undefined
						});
					}
				});

				let openRouterGenId: string | undefined = undefined;
				let content = '';
				let reasoning: string | undefined = undefined;

				for await (const chunk of fullStream) {
					if (chunk.type === 'text-delta') {
						openRouterGenId = chunk.id;
						content += chunk.text;
						appendChunk({ chunk: chunk.text, type: 'text', append });
					} else if (chunk.type === 'reasoning-delta') {
						if (reasoning === undefined) {
							reasoning = '';
						}
						reasoning += chunk.text;
						appendChunk({ chunk: chunk.text, type: 'reasoning', append });
					}
				}

				const usage = await totalUsage;

				await ctx.runMutation(internal.messages.updateMessageContent, {
					messageId: last.assistantMessage._id,
					content,
					reasoning,
					meta: {
						generationId: openRouterGenId,
						tokenUsage: usage.totalTokens
					}
				});

				if (openRouterGenId) {
					// we wait long enough for the gen to propagate to openrouter
					ctx.scheduler.runAfter(1000, internal.messages.getGenerationCost, {
						genId: openRouterGenId,
						messageId: last.assistantMessage._id,
						apiKey: apiKey ?? ''
					});
				}
			} catch (error) {
				if (!last) return;
				await ctx.runMutation(internal.messages.updateMessageError, {
					messageId: last.assistantMessage._id,
					error:
						error instanceof AISDKError
							? error.message
							: 'There was an error generating the response'
				});
			}
		}
	);

	response.headers.set('Access-Control-Allow-Origin', '*');
	response.headers.set('Vary', 'Origin');
	return response;
});

export const getGenerationCost = internalAction({
	args: {
		genId: v.string(),
		messageId: v.id('messages'),
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		try {
			const response = await fetch(`https://openrouter.ai/api/v1/generation?id=${args.genId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${args.apiKey}`
				}
			});

			const data = await response.json();

			const totalCost = data.data.total_cost;

			await ctx.runMutation(internal.messages.updateGenerationCost, {
				messageId: args.messageId,
				cost: totalCost
			});
		} catch (error) {
			console.error(error);
		}
	}
});

export const updateGenerationCost = internalMutation({
	args: {
		messageId: v.id('messages'),
		cost: v.number()
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		if (!message) throw new Error('Message not found');
		if (message.role !== 'assistant') throw new Error('Message is not an assistant message');

		await ctx.db.patch(args.messageId, {
			meta: {
				...message.meta,
				cost: args.cost
			}
		});
	}
});

export const startGenerating = internalMutation({
	args: {
		messageId: v.id('messages')
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		if (!message) throw new Error('Message not found');
		if (message.role !== 'assistant') throw new Error('Message is not an assistant message');

		await Promise.all([
			ctx.db.patch(args.messageId, {
				meta: {
					...message.meta,
					startedGenerating: Date.now()
				}
			}),
			ctx.db.patch(message.chatId, {
				generating: true
			})
		]);
	}
});

export const getMessagesForChat = internalQuery({
	args: {
		chatId: v.id('chat')
	},
	handler: async (ctx, args): Promise<MessageWithAttachments[]> => {
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error('Chat not found');

		return await getChatMessagesInternal(ctx, args.chatId);
	}
});

export const updateMessageContent = internalMutation({
	args: {
		messageId: v.id('messages'),
		content: v.string(),
		reasoning: v.optional(v.string()),
		meta: v.object({
			generationId: v.optional(v.string()),
			tokenUsage: v.optional(v.number())
		})
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		if (!message) throw new Error('Message not found');
		if (message.role !== 'assistant') throw new Error('Message is not an assistant message');
		await Promise.all([
			ctx.db.patch(args.messageId, {
				content: args.content,
				reasoning: args.reasoning,
				meta: {
					...message.meta,
					stoppedGenerating: Date.now(),
					...args.meta
				}
			}),
			ctx.db.patch(message.chatId, {
				generating: false,
				updatedAt: Date.now()
			})
		]);
	}
});

export const updateMessageError = internalMutation({
	args: {
		messageId: v.id('messages'),
		error: v.string()
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		if (!message) throw new Error('Message not found');
		if (message.role !== 'assistant') throw new Error('Message is not an assistant message');
		await Promise.all([
			ctx.db.patch(args.messageId, {
				error: args.error,
				meta: {
					...message.meta,
					stoppedGenerating: Date.now()
				}
			}),
			ctx.db.patch(message.chatId, {
				generating: false,
				updatedAt: Date.now()
			})
		]);
	}
});
