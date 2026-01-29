import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, mutation } from './functions';
import {
	getChatMessages,
	getChatMessagesInternal,
	type MessageWithAttachments
} from './chats.utils';
import { internalQuery, query } from './_generated/server';
import { api, internal } from './_generated/api';
import { persistentTextStreaming } from './persistent-text-streaming.utils';
import { Prompt } from './messages';
import { asyncMap } from 'convex-helpers';
import { deserializeStream } from '../utils/stream-transport-protocol';
import removeMarkdown from 'remove-markdown';
import { createMatch, type MatchedText } from '../utils/full-text-search';

export const getAll = query({
	args: {},
	handler: async (ctx): Promise<Doc<'chats'>[]> => {
		const user = await ctx.auth.getUserIdentity();

		if (!user) return [];

		const chats = await ctx.db
			.query('chats')
			.withIndex('by_user', (q) => q.eq('userId', user.subject))
			.collect();

		return chats.sort((a, b) => b.updatedAt - a.updatedAt);
	}
});

export const search = query({
	args: {
		query: v.string()
	},
	handler: async (
		ctx,
		args
	): Promise<
		{
			_id: Id<'chats'>;
			matchedTitle: MatchedText;
			matchedMessage?: MatchedText;
		}[]
	> => {
		if (args.query.trim().length === 0) return [];

		const user = await ctx.auth.getUserIdentity();
		if (!user) return [];

		const chatCache = new Map<
			Id<'chats'>,
			{ chat: Doc<'chats'> | null; messages: Doc<'messages'>[] }
		>();

		const [chatResults, messageResults] = await Promise.all([
			ctx.db
				.query('chats')
				.withSearchIndex('search_title', (q) =>
					q.search('title', args.query).eq('userId', user.subject)
				)
				.collect(),
			ctx.db
				.query('messages')
				.withSearchIndex('search_content', (q) =>
					q.search('content', args.query).eq('userId', user.subject)
				)
				.collect()
		]);

		const allResults = [...chatResults, ...messageResults];

		allResults.forEach((result) => {
			if ('chatId' in result) {
				// message
				const ogChat = chatCache.get(result.chatId);
				if (ogChat) {
					ogChat.messages.push(result);
					chatCache.set(result.chatId, ogChat);
					return;
				}

				chatCache.set(result.chatId, { chat: null, messages: [result] });
			} else {
				// chat
				const ogChat = chatCache.get(result._id);
				if (ogChat) {
					// this really shouldn't happen but just in case
					ogChat.chat = result;
					chatCache.set(result._id, ogChat);
					return;
				}

				chatCache.set(result._id, { chat: result, messages: [] });
			}
		});

		return await asyncMap(
			Array.from(chatCache.entries()).sort((a, b) => {
				// Check if each has a title match
				const hasTitleMatchA = a[1].chat !== null;
				const hasTitleMatchB = b[1].chat !== null;

				// Priority 1: Title matches come first
				if (hasTitleMatchA && !hasTitleMatchB) return -1;
				if (!hasTitleMatchA && hasTitleMatchB) return 1;

				// Priority 2: Sort by number of content matches (descending)
				// More messages = higher priority
				return b[1].messages.length - a[1].messages.length;
			}),
			async ([chatId, { chat, messages }]) => {
				// backfill the chat if the only matches were messages
				let chatResult: Doc<'chats'>;
				if (chat) {
					chatResult = chat;
				} else {
					chatResult = (await ctx.db.get(chatId))!;
				}

				let matchedTitle: MatchedText;
				if (chat === null) {
					matchedTitle = {
						text: chatResult.title,
						word: undefined
					};
				} else {
					matchedTitle = createMatch(chatResult.title, args.query);
				}

				let matchedMessage: MatchedText | undefined = undefined;
				for (const message of messages) {
					if (message.role === 'assistant') {
						const deserializedContentResult = deserializeStream({
							text: message.content ?? '',
							stack: []
						});
						if (deserializedContentResult.isErr()) {
							continue;
						}

						const parts = deserializedContentResult.value.stack;

						for (const part of parts) {
							if (part.type === 'text') {
								const matchResult = createMatch(removeMarkdown(part.text), args.query);
								if (matchResult.word) {
									matchedMessage = matchResult;
									break;
								}
							} else if (part.type === 'reasoning') {
								const matchResult = createMatch(removeMarkdown(part.text), args.query);
								if (matchResult.word) {
									matchedMessage = matchResult;
									break;
								}
							}
						}

						if (matchedMessage) break;
					}

					const matchResult = createMatch(removeMarkdown(message.content ?? ''), args.query);
					if (matchResult.word) {
						matchedMessage = matchResult;
						break;
					}
				}

				return {
					_id: chatId,
					matchedTitle,
					matchedMessage
				};
			}
		);
	}
});

export const get = query({
	args: {
		chatId: v.id('chats')
	},
	handler: async (
		ctx,
		args
	): Promise<(Doc<'chats'> & { messages: MessageWithAttachments[] }) | null> => {
		const user = await ctx.auth.getUserIdentity();

		const chat = await ctx.db.get(args.chatId);
		if (!chat || (chat.userId !== user?.subject && !chat.public)) return null;

		const messages = await getChatMessages(ctx, args.chatId);

		return {
			...chat,
			messages
		};
	}
});

export const getPublic = query({
	args: {
		chatId: v.id('chats')
	},
	handler: async (
		ctx,
		args
	): Promise<(Doc<'chats'> & { messages: MessageWithAttachments[] }) | null> => {
		const chat = await ctx.db.get(args.chatId);
		if (!chat || !chat.public) return null;

		const messages = await getChatMessages(ctx, args.chatId);

		return {
			...chat,
			messages
		};
	}
});

export const internalGet = internalQuery({
	args: {
		chatId: v.id('chats')
	},
	handler: async (ctx, args): Promise<Doc<'chats'> & { messages: MessageWithAttachments[] }> => {
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error('Chat not found');

		const messages = await getChatMessagesInternal(ctx, args.chatId);

		return {
			...chat,
			messages
		};
	}
});

export const internalGetChat = internalQuery({
	args: {
		chatId: v.id('chats')
	},
	handler: async (ctx, args): Promise<Doc<'chats'> | null> => {
		return await ctx.db.get(args.chatId);
	}
});

export const updatePinned = mutation({
	args: {
		chatId: v.id('chats'),
		pinned: v.boolean()
	},
	handler: async (ctx, args): Promise<void> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		const chat = await ctx.db.get(args.chatId);
		if (!chat || chat.userId !== user.subject)
			throw new Error('Chat not found or you are not authorized to access it');

		await ctx.db.patch(args.chatId, {
			pinned: args.pinned
		});
	}
});

export const updateTitle = mutation({
	args: {
		chatId: v.id('chats'),
		title: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		const chat = await ctx.db.get(args.chatId);
		if (!chat || chat.userId !== user.subject)
			throw new Error('Chat not found or you are not authorized to access it');

		await ctx.db.patch(args.chatId, {
			title: args.title
		});
	}
});

export const remove = mutation({
	args: {
		ids: v.array(v.id('chats'))
	},
	handler: async (ctx, args): Promise<void> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		for (const id of args.ids) {
			const chat = await ctx.db.get(id);
			if (!chat || chat.userId !== user.subject)
				throw new Error('Chat not found or you are not authorized to access it');

			await ctx.db.delete(id);
		}
	}
});

export const updateGenerating = internalMutation({
	args: {
		chatId: v.id('chats'),
		generating: v.boolean()
	},
	handler: async (ctx, args): Promise<void> => {
		await ctx.db.patch(args.chatId, {
			generating: args.generating
		});
	}
});

export const updateGeneratedTitle = internalMutation({
	args: {
		chatId: v.id('chats'),
		title: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		await ctx.db.patch(args.chatId, {
			title: args.title,
			generatingTitle: false
		});
	}
});

export const branchFromMessage = mutation({
	args: {
		message: v.union(
			v.object({
				_id: v.id('messages'),
				role: v.literal('user'),
				modelId: v.string(),
				supportedParameters: v.array(v.string()),
				inputModalities: v.array(v.string()),
				outputModalities: v.array(v.string())
			}),
			v.object({
				_id: v.id('messages'),
				role: v.literal('assistant'),
				prompt: v.optional(Prompt)
			})
		),
		apiKey: v.string()
	},
	handler: async (
		ctx,
		args
	): Promise<{ newChatId: Id<'chats'>; newAssistantMessageId: Id<'messages'> | null }> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		const sourceMessage = await ctx.db.get(args.message._id);
		if (!sourceMessage || sourceMessage.role !== args.message.role) {
			throw new Error('Source message not found');
		}

		const ogChat = await ctx.runQuery(internal.chats.internalGet, { chatId: sourceMessage.chatId });
		if (!ogChat || (ogChat.userId !== user.subject && !ogChat.public)) {
			throw new Error('Chat not found or you are not authorized to access it');
		}

		const chatIndex = ogChat.messages.findIndex((m) => m._id === args.message._id);
		if (chatIndex === -1) {
			throw new Error('Source message not found in chat');
		}

		const messages = ogChat.messages.slice(0, chatIndex + 1);

		// copy over the chat
		const newChatId = await ctx.db.insert('chats', {
			userId: user.subject,
			title: ogChat.title,
			generating: false,
			updatedAt: Date.now(),
			pinned: false,
			branchedFrom: {
				chatId: ogChat._id,
				messageId: args.message._id
			}
		});
		// get related attachments
		const relatedAttachments = (
			await ctx.db
				.query('chatAttachments')
				.withIndex('by_chat', (q) => q.eq('chatId', ogChat._id))
				.collect()
		).filter((a) => messages.some((m) => m._id === a.messageId));
		// copy over the messages with attachments
		await Promise.all(
			messages.map(async (m) => {
				const ogAttachments = relatedAttachments.filter((a) => a.messageId === m._id);
				let newMessageId: Id<'messages'>;
				if (m.role === 'user') {
					newMessageId = await ctx.db.insert('messages', {
						userId: user.subject,
						role: 'user',
						chatId: newChatId,
						content: m.content,
						chatSettings:
							m._id === args.message._id && args.message.role === 'user'
								? {
										modelId: args.message.modelId,
										supportedParameters: args.message.supportedParameters,
										inputModalities: args.message.inputModalities,
										outputModalities: args.message.outputModalities
									}
								: m.chatSettings
					});
				} else {
					newMessageId = await ctx.db.insert('messages', {
						role: 'assistant',
						userId: user.subject,
						chatId: newChatId,
						streamId: m.streamId,
						meta: m.meta,
						content: m.content,
						error: m.error
					});
				}
				// copy over attachments
				await Promise.all(
					ogAttachments.map((a) =>
						ctx.db.insert('chatAttachments', {
							messageId: newMessageId,
							chatId: newChatId,
							userId: user.subject,
							key: a.key,
							mediaType: a.mediaType
						})
					)
				);
			})
		);

		let newAssistantMessageId: Id<'messages'> | null = null;
		// if the source message is a user message we need to generate a new assistant message
		if (sourceMessage.role === 'user' && args.message.role === 'user') {
			const streamId = await persistentTextStreaming.createStream(ctx);
			newAssistantMessageId = await ctx.db.insert('messages', {
				chatId: newChatId,
				userId: user.subject,
				role: 'assistant',
				streamId,
				meta: {
					modelId: args.message.modelId
				}
			});
		} else if (
			sourceMessage.role === 'assistant' &&
			args.message.role === 'assistant' &&
			args.message.prompt !== undefined
		) {
			// if a prompt is provided with an assistant message we need create a new user message and then generate a new assistant message
			const { assistantMessageId } = await ctx.runMutation(api.messages.create, {
				apiKey: args.apiKey,
				prompt: args.message.prompt,
				chatId: newChatId
			});

			newAssistantMessageId = assistantMessageId;
		}

		return { newChatId, newAssistantMessageId };
	}
});

export const updatePublic = mutation({
	args: {
		chatId: v.id('chats'),
		public: v.boolean()
	},
	handler: async (ctx, args): Promise<void> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		const chat = await ctx.db.get(args.chatId);
		if (!chat || chat.userId !== user.subject)
			throw new Error('Chat not found or you are not authorized to access it');

		await ctx.db.patch(args.chatId, {
			public: args.public
		});
	}
});
