import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, mutation } from './functions';
import {
	getChatMessages,
	getChatMessagesInternal,
	type MessageWithAttachments
} from './chats.utils';
import { internalQuery, query } from './_generated/server';
import { internal } from './_generated/api';
import { persistentTextStreaming } from './persistent-text-streaming.utils';

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

export const get = query({
	args: {
		chatId: v.id('chats')
	},
	handler: async (ctx, args): Promise<Doc<'chats'> & { messages: MessageWithAttachments[] }> => {
		const user = await ctx.auth.getUserIdentity();

		const chat = await ctx.db.get(args.chatId);
		if (!chat || chat.userId !== user?.subject)
			throw new Error('Chat not found or you are not authorized to access it');

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
				role: v.literal('assistant')
			})
		)
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
		if (!ogChat || ogChat.userId !== user.subject) {
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
				role: 'assistant',
				streamId,
				meta: {
					modelId: args.message.modelId
				}
			});
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
