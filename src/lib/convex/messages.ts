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
	type ImagePart,
	type FilePart,
	streamText,
	smoothStream,
	hasToolCall
} from 'ai';
import {
	getChatMessagesInternal,
	getLastUserAndAssistantMessages,
	type MessageWithAttachments
} from './chats.utils';
import { TITLE_GENERATION_MODEL } from '../ai.js';
import {
	askUser,
	chatSearchTool,
	fetchLinkContentTool,
	getChat,
	webSearch,
	type AskUserAnswer
} from '../features/ai/tools/index.js';
import {
	createChunkAppender,
	deserializeStream,
	partsToModelMessage,
	repackStream,
	serializeParts,
	type StreamResult
} from '../utils/stream-transport-protocol';
import { persistentTextStreaming } from './persistent-text-streaming.utils';
import { r2 } from './r2';
import { createKey } from './chatAttachments.utils';
import { env } from '../env.convex';
import type { ContextType } from '../features/ai/tools/index.js';
import { truncateRight } from '../utils/strings';
import { rateLimiter } from './rateLimiter';
import { formatTimeUntil } from '../utils/time';
import { ReasoningEffort } from './schema';

export const Prompt = v.object({
	modelId: v.string(),
	input: v.string(),
	attachments: v.optional(
		v.array(
			v.object({
				url: v.string(),
				key: v.string(),
				mediaType: v.string(),
				fileName: v.optional(v.string()),
				width: v.optional(v.number()),
				height: v.optional(v.number())
			})
		)
	),
	supportedParameters: v.array(v.string()),
	inputModalities: v.array(v.string()),
	outputModalities: v.array(v.string()),
	reasoningEffort: v.optional(ReasoningEffort)
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
		} else {
			chatId = args.chatId;
			await ctx.db.patch(chatId, {
				updatedAt: Date.now()
			});

			const chat = await ctx.runQuery(internal.chats.internalGet, { chatId });
			const isChatOwner = chat?.userId === user.subject;

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
				outputModalities: args.prompt.outputModalities,
				reasoningEffort: args.prompt.reasoningEffort
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
						mediaType: attachment.mediaType,
						fileName: attachment.fileName,
						width: attachment.width,
						height: attachment.height
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

export const editMessage = mutation({
	args: {
		messageId: v.id('messages'),
		prompt: Prompt,
		apiKey: v.string()
	},
	handler: async (
		ctx,
		args
	): Promise<{
		assistantMessageId: Id<'messages'>;
	}> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new ConvexError('Unauthorized');

		const sourceMessage = await ctx.db.get(args.messageId);
		if (!sourceMessage) throw new ConvexError('Message not found');
		if (sourceMessage.role !== 'user') throw new ConvexError('Only user messages can be edited');
		if (sourceMessage.userId !== user.subject) throw new ConvexError('Unauthorized');

		const chat = await ctx.db.get(sourceMessage.chatId);
		if (!chat) throw new ConvexError('Chat not found');
		if (chat.userId !== user.subject) throw new ConvexError('Unauthorized');
		if (chat.generating)
			throw new ConvexError('Stop the current response before editing a message');

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

		const allMessages = await ctx.db
			.query('messages')
			.withIndex('by_chat', (q) => q.eq('chatId', sourceMessage.chatId))
			.collect();

		// delete everything after the edited message (and the old attachments for it)
		const messagesToRemove = allMessages.filter(
			(m) => m._creationTime > sourceMessage._creationTime
		);

		for (const m of messagesToRemove) {
			const attachments = await ctx.db
				.query('chatAttachments')
				.withIndex('by_message', (q) => q.eq('messageId', m._id))
				.collect();
			for (const a of attachments) {
				await ctx.db.delete(a._id);
			}
			await ctx.db.delete(m._id);
		}

		// replace attachments for the edited message
		const existingAttachments = await ctx.db
			.query('chatAttachments')
			.withIndex('by_message', (q) => q.eq('messageId', args.messageId))
			.collect();
		for (const a of existingAttachments) {
			await ctx.db.delete(a._id);
		}

		await ctx.db.patch(args.messageId, {
			content: args.prompt.input,
			chatSettings: {
				modelId: args.prompt.modelId,
				supportedParameters: args.prompt.supportedParameters,
				inputModalities: args.prompt.inputModalities,
				outputModalities: args.prompt.outputModalities,
				reasoningEffort: args.prompt.reasoningEffort
			}
		});

		if (args.prompt.attachments && args.prompt.attachments.length > 0) {
			await Promise.all(
				args.prompt.attachments.map(async (attachment) => {
					await ctx.runMutation(internal.chatAttachments.create, {
						chatId: sourceMessage.chatId,
						messageId: args.messageId,
						key: attachment.key,
						userId: user.subject,
						mediaType: attachment.mediaType,
						fileName: attachment.fileName,
						width: attachment.width,
						height: attachment.height
					});
				})
			);
		}

		const isImageModel =
			args.prompt.outputModalities.length === 1 && args.prompt.outputModalities[0] === 'image';

		const streamId = await persistentTextStreaming.createStream(ctx);
		const assistantMessageId = await ctx.db.insert('messages', {
			chatId: sourceMessage.chatId,
			userId: user.subject,
			role: 'assistant',
			streamId,
			meta: {
				modelId: args.prompt.modelId,
				imageGen: isImageModel
			}
		});

		await ctx.db.patch(sourceMessage.chatId, {
			updatedAt: Date.now()
		});

		return { assistantMessageId };
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let streamResult: StreamTextResult<any, any> | null = null;
			try {
				const { messages, chat, memoryEnabled } = await ctx.runQuery(
					internal.messages.getMessagesForChat,
					{
						chatId
					}
				);

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
				const toUserAttachmentPart = (attachment: {
					url: string;
					mediaType: string;
				}): ImagePart | FilePart =>
					attachment.mediaType.startsWith('image/')
						? ({ type: 'image', image: attachment.url } satisfies ImagePart)
						: ({
								type: 'file',
								data: attachment.url,
								mediaType: attachment.mediaType
							} satisfies FilePart);

				// Assistant-generated attachments (e.g. images from an image model)
				// have to ride on the *next* user turn: the OpenRouter/OpenAI chat
				// schema has no slot for files on an assistant message and the
				// provider adapter drops them silently, so the follow-up model would
				// otherwise never see the image it produced.
				const modelMessages: ModelMessage[] = [];
				let carriedAssistantAttachments: (ImagePart | FilePart)[] = [];

				for (const message of messages) {
					if (message.role === 'assistant') {
						const assistantMessages = partsToModelMessage(message.parts);
						const carried = message.attachments.map(toUserAttachmentPart);

						if (assistantMessages.length === 0 && carried.length > 0) {
							// Preserve user/assistant alternation when the assistant turn
							// was image-only with no text or reasoning.
							modelMessages.push({
								role: 'assistant',
								content: [{ type: 'text', text: '[generated attachment]' }]
							});
						} else {
							modelMessages.push(...assistantMessages);
						}

						carriedAssistantAttachments = carried;
						continue;
					}

					const userAttachmentParts = message.attachments?.map(toUserAttachmentPart) ?? [];

					const content: ({ type: 'text'; text: string } | ImagePart | FilePart)[] = [];

					if (carriedAssistantAttachments.length > 0) {
						content.push({
							type: 'text',
							text: 'Your previous response included the following generated attachment(s):'
						});
						content.push(...carriedAssistantAttachments);
						carriedAssistantAttachments = [];
					}

					content.push({ type: 'text', text: message.content ?? '' });
					content.push(...userAttachmentParts);

					modelMessages.push({
						role: 'user',
						content
					});
				}

				if (systemPrompt) {
					modelMessages.unshift({
						role: 'system',
						content: `The following prompt has been provided by the user to customize your behavior.
<user_prompt>
${systemPrompt}
</user_prompt>`
					});
				}

				const effort = last.userMessage.chatSettings.reasoningEffort;
				const providerOptions =
					effort && effort !== 'default'
						? {
								openrouter: {
									reasoning: {
										effort
									}
								}
							}
						: undefined;

				let wasStopped = false;
				let stopPollActive = true;

				// Poll for stop requests in the background so the chunk loop below never
				// has to wait on a database roundtrip. On stop, we flip a flag that the
				// chunk loop checks; we deliberately don't abort the AI SDK stream because
				// doing so rejects its internal promises in ways that conflict with the
				// persistent-text-streaming library's writer cleanup.
				const stopPoller = (async () => {
					const intervalMs = 500;
					while (stopPollActive) {
						await new Promise((resolve) => setTimeout(resolve, intervalMs));
						if (!stopPollActive) return;
						try {
							const stopRequested = await ctx.runQuery(internal.chats.isStopRequested, {
								chatId
							});
							if (stopRequested) {
								wasStopped = true;
								return;
							}
						} catch {
							// Transient query failure — try again on the next tick.
						}
					}
				})();

				if (last.userMessage.chatSettings.supportedParameters?.includes('tools')) {
					const agent = new ToolLoopAgent({
						model: openrouter.chat(last.userMessage.chatSettings.modelId),
						tools: {
							fetchLinkContent: fetchLinkContentTool,
							webSearch: webSearch,
							askUser,
							...(memoryEnabled ? { chatSearch: chatSearchTool, getChat } : {})
						},
						stopWhen: [
							({ steps }) => {
								return steps.length >= 10;
							},
							// `askUser` has no server-side executor — it is answered by the
							// user in the UI. Stop the loop as soon as the model calls it so
							// the stream finalizes and the UI can render the form.
							hasToolCall('askUser')
						],
						experimental_context: {
							env: {
								GITHUB_TOKEN: env.GITHUB_TOKEN
							},
							ctx,
							chatId: chat._id
						} satisfies ContextType,
						providerOptions
					});

					streamResult = await agent.stream({
						messages: modelMessages,
						experimental_transform: smoothStream()
					});
				} else {
					streamResult = streamText({
						model: openrouter.chat(last.userMessage.chatSettings.modelId),
						messages: modelMessages,
						experimental_transform: smoothStream(),
						providerOptions
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
					if (wasStopped) break;

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

				// Let the background poller exit.
				stopPollActive = false;
				await stopPoller;

				// Only await usage when the stream completed naturally — the promise
				// never resolves once we've broken out early.
				let usage: Awaited<typeof totalUsage> | null = null;
				if (!wasStopped) {
					usage = await totalUsage;
				}

				if (uploadPromises.length > 0) {
					await Promise.all(uploadPromises);
				}

				// If the stream was aborted before any content was emitted, `content` is
				// empty and the protocol-versioned repack will fail — fall back to empty
				// so we still clear `generating` on the chat.
				const repackResult = content.length > 0 ? repackStream(content) : null;
				const repackedContent = repackResult?.isOk() ? repackResult.value : '';

				await ctx.runMutation(internal.messages.updateMessageContent, {
					messageId: last.assistantMessage._id,
					content: repackedContent,
					meta: {
						generationId: openRouterGenId,
						tokenUsage: usage?.totalTokens,
						outputTokens: usage?.outputTokens,
						inputTokens: usage?.inputTokens
					}
				});

				if (wasStopped) {
					await ctx.runMutation(internal.chats.clearStopRequested, { chatId });
				}

				if (openRouterGenId) {
					// we wait long enough for the gen to propagate to openrouter
					ctx.scheduler.runAfter(1000, internal.messages.getGenerationCost, {
						genId: openRouterGenId,
						messageId: last.assistantMessage._id,
						apiKey: apiKeyToUse
					});
				}
			} catch {
				if (!last) return;
				if (!streamResult) return;

				let error: unknown | null = null;
				for await (const chunk of streamResult.fullStream) {
					if (chunk.type === 'error') {
						error = chunk.error; // only take the last error
					}
				}

				await ctx.runMutation(internal.messages.updateMessageError, {
					messageId: last.assistantMessage._id,
					error: AISDKError.isInstance(error)
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
		apiKey: v.string(),
		retries: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const maxRetries = 3;
		const retryDelay = 5000;
		try {
			const response = await fetch(`https://openrouter.ai/api/v1/generation?id=${args.genId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${args.apiKey}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to get generation cost: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

			const totalCost = data.data.total_cost;

			await ctx.runMutation(internal.messages.updateGenerationCost, {
				messageId: args.messageId,
				cost: totalCost
			});
		} catch (error) {
			if (args.retries ?? 0 >= maxRetries) {
				console.log(`Failed to get generation cost after ${maxRetries} retries: `, error);
				return;
			}
			console.log(`Retrying in ${retryDelay}ms...`);
			await ctx.scheduler.runAfter(retryDelay, internal.messages.getGenerationCost, {
				genId: args.genId,
				messageId: args.messageId,
				apiKey: args.apiKey,
				retries: args.retries ?? 0 + 1
			});
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
				generating: true,
				stopRequested: undefined
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
	): Promise<{
		chat: Doc<'chats'>;
		messages: MessageWithAttachments[];
		memoryEnabled: boolean;
	}> => {
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new ConvexError('Chat not found');

		const messages = await getChatMessagesInternal(ctx, args.chatId);
		const userSettings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', chat.userId))
			.first();
		const memoryEnabled = userSettings?.memoryEnabled ?? false;

		return {
			chat,
			messages,
			memoryEnabled
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

export const AskUserAnswerV = v.object({
	questionId: v.string(),
	selected: v.array(v.string()),
	other: v.optional(v.string())
});

export const submitQuestionAnswers = mutation({
	args: {
		messageId: v.id('messages'),
		answers: v.array(AskUserAnswerV)
	},
	handler: async (
		ctx,
		args
	): Promise<{ chatId: Id<'chats'>; assistantMessageId: Id<'messages'> }> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new ConvexError('Unauthorized');

		const message = await ctx.db.get(args.messageId);
		if (!message) throw new ConvexError('Message not found');
		if (message.role !== 'assistant')
			throw new ConvexError('Only assistant messages can have question answers');
		if (message.userId !== user.subject) throw new ConvexError('Unauthorized');

		const chat = await ctx.db.get(message.chatId);
		if (!chat) throw new ConvexError('Chat not found');
		if (chat.userId !== user.subject) throw new ConvexError('Unauthorized');
		if (chat.generating)
			throw new ConvexError('Stop the current response before answering questions');

		const parsed = deserializeStream({ text: message.content ?? '' });
		if (parsed.isErr()) throw new ConvexError('Could not parse message');

		const parts: StreamResult = [...parsed.value.stack];

		// Find the most recent `askUser` tool-call that does not yet have a result.
		let pendingCallIndex = -1;
		for (let i = parts.length - 1; i >= 0; i--) {
			const p = parts[i];
			if (p.type !== 'tool-call' || p.toolName !== 'askUser') continue;
			const hasResult = parts.some(
				(r) => r.type === 'tool-result' && r.toolCallId === p.toolCallId
			);
			if (!hasResult) {
				pendingCallIndex = i;
				break;
			}
		}

		if (pendingCallIndex === -1) {
			throw new ConvexError('No pending question on this message');
		}

		const pendingCall = parts[pendingCallIndex];
		if (pendingCall.type !== 'tool-call') {
			throw new ConvexError('Internal error: expected tool-call');
		}

		// Match the shape used by server-executed tools: the raw result object is
		// stored on `output` directly (e.g. webSearch stores `{ todaysDate, results }`
		// without a `{ type: 'json', value: ... }` wrapper). `normalizeToolResultOutput`
		// wraps it when converting to a ModelMessage for the next generation.
		const output: { answers: AskUserAnswer[] } = { answers: args.answers };
		parts.push({
			type: 'tool-result',
			toolCallId: pendingCall.toolCallId,
			toolName: 'askUser',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			output: output as any
		});

		await ctx.db.patch(args.messageId, {
			content: serializeParts(parts)
		});

		const streamId = await persistentTextStreaming.createStream(ctx);
		const assistantMessageId = await ctx.db.insert('messages', {
			chatId: message.chatId,
			userId: user.subject,
			role: 'assistant',
			streamId,
			meta: {
				modelId: message.meta.modelId
			}
		});

		await ctx.db.patch(message.chatId, {
			updatedAt: Date.now()
		});

		return { chatId: message.chatId, assistantMessageId };
	}
});
