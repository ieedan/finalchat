import { ConvexError, v } from 'convex/values';
import { httpAction, internalAction, internalQuery, query } from './_generated/server';
import { mutation, internalMutation } from './functions';
import { api, internal } from './_generated/api';
import { type StreamId, StreamIdValidator } from '@convex-dev/persistent-text-streaming';
import type { Doc, Id } from './_generated/dataModel';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
	generateText,
	AISDKError,
	ToolLoopAgent,
	type StreamTextResult,
	type ModelMessage,
	streamText,
	smoothStream
} from 'ai';
import {
	getChatMessagesInternal,
	getLastUserAndAssistantMessages,
	type MessageWithAttachments
} from './chats.utils';
import { TITLE_GENERATION_MODEL } from '../ai.js';
import { fetchLinkContentTool } from './ai.utils.js';
import { createChunkAppender, partsToModelMessage } from '../utils/stream-transport-protocol';
import { persistentTextStreaming } from './persistent-text-streaming.utils';
import { r2 } from './r2';
import { createKey } from './chatAttachments.utils';
import { env } from '../env.convex';
import type { ContextType } from './ai.utils';
import { truncateRight } from '../utils/strings';
import { rateLimiter } from './rateLimiter';
import { formatTimeUntil } from '../utils/time';

export const Prompt = v.object({
	modelId: v.string(),
	input: v.string(),
	attachments: v.optional(
		v.array(
			v.object({
				url: v.string(),
				key: v.string(),
				mediaType: v.string()
			})
		)
	),
	supportedParameters: v.array(v.string()),
	inputModalities: v.array(v.string()),
	outputModalities: v.array(v.string())
});

export const create = mutation({
	args: {
		chatId: v.optional(v.id('chats')),
		prompt: Prompt,
		apiKey: v.string()
	},
	handler: async (
		ctx,
		args
	): Promise<{
		chatId: Id<'chats'>;
		assistantMessageId: Id<'messages'>;
	}> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new ConvexError('Unauthorized');

		const isFreeUser = args.apiKey.trim() === '';

		if (isFreeUser && !args.prompt.modelId.endsWith(':free')) {
			throw new ConvexError('API key is required for non-free models');
		}

		if (isFreeUser) {
			const status = await rateLimiter.limit(ctx, 'freeMessages', { key: user.subject });
			if (!status.ok) {
				throw new ConvexError(
					`Rate limit exceeded. Try again in ${formatTimeUntil(status.retryAfter)}`
				);
			}
		}

		let isChatOwner: boolean;
		let chatId: Id<'chats'>;
		if (!args.chatId) {
			chatId = await ctx.db.insert('chats', {
				userId: user.subject,
				title: isFreeUser ? truncateRight(args.prompt.input, 30) : 'Untitled Chat',
				generating: false,
				updatedAt: Date.now(),
				pinned: false
			});

			if (!isFreeUser) {
				ctx.scheduler.runAfter(0, internal.messages.generateChatTitle, {
					chatId,
					apiKey: args.apiKey
				});
			}

			isChatOwner = true;
		} else {
			chatId = args.chatId;
			await ctx.db.patch(chatId, {
				updatedAt: Date.now()
			});

			const chat = await ctx.runQuery(internal.chats.internalGet, { chatId });
			isChatOwner = chat?.userId === user.subject;

			if (!isChatOwner) {
				const lastMessages = getLastUserAndAssistantMessages(chat.messages);
				if (!lastMessages) throw new ConvexError('No last messages found');
				// if we aren't the chat owner we are going to fork the chat from the last assistant message
				const { newChatId, newAssistantMessageId } = await ctx.runMutation(
					api.chats.branchFromMessage,
					{
						message: {
							_id: lastMessages.assistantMessage._id,
							role: 'assistant',
							prompt: args.prompt
						},
						apiKey: args.apiKey
					}
				);

				if (!newAssistantMessageId) throw new ConvexError('Failed to branch from message');

				return {
					chatId: newChatId,
					assistantMessageId: newAssistantMessageId
				};
			}
		}

		const userMessageId = await ctx.db.insert('messages', {
			userId: user.subject,
			chatId,
			role: 'user',
			content: args.prompt.input,
			chatSettings: {
				modelId: args.prompt.modelId,
				supportedParameters: args.prompt.supportedParameters,
				inputModalities: args.prompt.inputModalities,
				outputModalities: args.prompt.outputModalities
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
						userId: user.subject,
						mediaType: attachment.mediaType
					});
				})
			);
		}

		const isImageModel =
			args.prompt.outputModalities.length === 1 && args.prompt.outputModalities[0] === 'image';

		const streamId = await persistentTextStreaming.createStream(ctx);
		const assistantMessageId = await ctx.db.insert('messages', {
			chatId,
			userId: user.subject,
			role: 'assistant',
			streamId,
			meta: {
				modelId: args.prompt.modelId,
				imageGen: isImageModel
			}
		});

		return {
			chatId,
			assistantMessageId
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
		chatId: v.id('chats'),
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		const chat = await ctx.runQuery(internal.chats.internalGet, { chatId: args.chatId });
		if (!chat) throw new ConvexError('Chat not found');

		if (chat.generatingTitle) return;

		await ctx.runMutation(internal.chats.updateGenerating, {
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
				.map((message) => {
					if (message.role === 'user') {
						return `<message role="${message.role}">
				${message.content}
			</message>`;
					}

					return `<message role="${message.role}">
				${message.parts
					.filter((part) => part.type === 'text')
					.map((part) => part.text)
					.join('')}
			</message>`;
				})
				.join('\n')}
			</chat>`
			});

			await ctx.runMutation(internal.chats.updateGeneratedTitle, {
				chatId: args.chatId,
				title: text
			});
		} catch (error) {
			console.error(error);
			await ctx.runMutation(internal.chats.updateGenerating, {
				chatId: args.chatId,
				generating: false
			});
		}
	}
});

export const streamMessage = httpAction(async (ctx, request) => {
	const { streamId, chatId, apiKey, systemPrompt } = (await request.json()) as {
		streamId: StreamId;
		chatId: Id<'chats'>;
		apiKey: string | undefined;
		systemPrompt: string | undefined;
	};

	const response = await persistentTextStreaming.stream(
		ctx,
		request,
		streamId,
		async (ctx, _request, _streamId, append) => {
			let last: ReturnType<typeof getLastUserAndAssistantMessages> | null = null;
			try {
				const { messages, chat } = await ctx.runQuery(internal.messages.getMessagesForChat, {
					chatId
				});

				last = getLastUserAndAssistantMessages(messages);
				if (!last) {
					throw new ConvexError('There was a problem getting the previous messages');
				}

				if (!apiKey && !last.userMessage.chatSettings.modelId.endsWith(':free')) {
					throw new ConvexError('API key is required for non-free models');
				}

				const isFreeUser = !apiKey && last.userMessage.chatSettings.modelId.endsWith(':free');
				const apiKeyToUse = isFreeUser ? env.OPENROUTER_API_KEY : (apiKey ?? '');

				// remove the assistant message so it's not part of the generation
				messages.pop();

				await ctx.runMutation(internal.messages.startGenerating, {
					messageId: last.assistantMessage._id
				});

				const openrouter = createOpenRouter({
					apiKey: apiKeyToUse
				});

				// convert messages into model messages
				const modelMessages: ModelMessage[] = messages.flatMap((message) => {
					if (message.role === 'assistant') {
						const modelMessages = partsToModelMessage(message.parts);

						return [
							...modelMessages,
							...(message.attachments.length > 0
								? [
										{
											role: 'assistant' as const,
											content: [
												...message.attachments.map((attachment) => ({
													type: 'file' as const,
													data: attachment.url,
													mediaType: 'image'
												}))
											]
										}
									]
								: [])
						];
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
				});

				if (systemPrompt) {
					modelMessages.unshift({
						role: 'system',
						content: `The following prompt has been provided by the user to customize your behavior.
<user_prompt>
${systemPrompt}
</user_prompt>`
					});
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				let streamResult: StreamTextResult<any, any>;
				if (last.userMessage.chatSettings.supportedParameters?.includes('tools')) {
					const agent = new ToolLoopAgent({
						model: openrouter.chat(last.userMessage.chatSettings.modelId),
						tools: {
							fetchLinkContent: fetchLinkContentTool
						},
						stopWhen: [
							({ steps }) => {
								return steps.length >= 10;
							}
						],
						experimental_context: {
							env: {
								GITHUB_TOKEN: env.GITHUB_TOKEN
							}
						} satisfies ContextType
					});

					streamResult = await agent.stream({
						messages: modelMessages,
						experimental_transform: smoothStream()
					});
				} else {
					streamResult = streamText({
						model: openrouter.chat(last.userMessage.chatSettings.modelId),
						messages: modelMessages,
						experimental_transform: smoothStream()
					});
				}

				const { fullStream, totalUsage } = streamResult;

				let openRouterGenId: string | undefined = undefined;
				let content = '';

				const appender = createChunkAppender({
					append: (chunk) => {
						append(chunk);
						content += chunk;
					}
				});

				const uploadPromises: Promise<void>[] = [];

				for await (const chunk of fullStream) {
					if (chunk.type === 'text-delta') {
						openRouterGenId = chunk.id;
						appender.append({ type: 'text', text: chunk.text });
					} else if (chunk.type === 'reasoning-delta') {
						appender.append({ type: 'reasoning', text: chunk.text });
					} else if (chunk.type === 'tool-call') {
						appender.append(chunk);
					} else if (chunk.type === 'tool-result') {
						appender.append({
							type: 'tool-result',
							toolName: chunk.toolName,
							toolCallId: chunk.toolCallId,
							// @ts-expect-error - TODO: for some reason the output is unknown
							output: chunk.output
						});
					} else if (chunk.type === 'file') {
						const file = chunk.file;
						if (file.mediaType.startsWith('image/')) {
							uploadPromises.push(
								(async () => {
									const binaryString = atob(file.base64);
									const bytes = new Uint8Array(binaryString.length);
									for (let i = 0; i < binaryString.length; i++) {
										bytes[i] = binaryString.charCodeAt(i);
									}

									const key = await r2.store(ctx, bytes, {
										key: createKey(chat.userId),
										type: file.mediaType
									});

									await ctx.runMutation(internal.chatAttachments.create, {
										chatId,
										messageId: last.assistantMessage._id,
										key,
										userId: chat.userId,
										mediaType: file.mediaType
									});
								})()
							);
						}
					}
				}

				const usage = await totalUsage;

				// wait for uploads to complete
				if (uploadPromises.length > 0) {
					await Promise.all(uploadPromises);
				}

				await ctx.runMutation(internal.messages.updateMessageContent, {
					messageId: last.assistantMessage._id,
					content,
					meta: {
						generationId: openRouterGenId,
						tokenUsage: usage.totalTokens,
						outputTokens: usage.outputTokens,
						inputTokens: usage.inputTokens
					}
				});

				if (openRouterGenId) {
					// we wait long enough for the gen to propagate to openrouter
					ctx.scheduler.runAfter(1000, internal.messages.getGenerationCost, {
						genId: openRouterGenId,
						messageId: last.assistantMessage._id,
						apiKey: apiKeyToUse
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
		if (!message) throw new ConvexError('Message not found');
		if (message.role !== 'assistant') throw new ConvexError('Message is not an assistant message');

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
		if (!message) throw new ConvexError('Message not found');
		if (message.role !== 'assistant') throw new ConvexError('Message is not an assistant message');

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
		chatId: v.id('chats')
	},
	handler: async (
		ctx,
		args
	): Promise<{ chat: Doc<'chats'>; messages: MessageWithAttachments[] }> => {
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new ConvexError('Chat not found');

		const messages = await getChatMessagesInternal(ctx, args.chatId);

		return {
			chat,
			messages
		};
	}
});

export const updateMessageContent = internalMutation({
	args: {
		messageId: v.id('messages'),
		content: v.string(),
		meta: v.object({
			generationId: v.optional(v.string()),
			tokenUsage: v.optional(v.number()),
			outputTokens: v.optional(v.number()),
			inputTokens: v.optional(v.number())
		})
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		if (!message) throw new ConvexError('Message not found');
		if (message.role !== 'assistant') throw new ConvexError('Message is not an assistant message');
		await Promise.all([
			ctx.db.patch(args.messageId, {
				content: args.content,
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
		if (!message) throw new ConvexError('Message not found');
		if (message.role !== 'assistant') throw new ConvexError('Message is not an assistant message');
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
