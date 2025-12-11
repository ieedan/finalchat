import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { internalMutation, mutation } from './functions';
import { getChatMessages, getChatMessagesInternal, MessageWithAttachments } from './chat.utils';
import { internalQuery, query } from './_generated/server';

export const getAll = query({
	args: {},
	handler: async (ctx): Promise<Doc<'chat'>[]> => {
		const user = await ctx.auth.getUserIdentity();

		if (!user) return [];

		const chats = await ctx.db
			.query('chat')
			.withIndex('by_user', (q) => q.eq('userId', user.subject))
			.collect();

		return chats.sort((a, b) => b.updatedAt - a.updatedAt);
	}
});

export const get = query({
	args: {
		chatId: v.id('chat')
	},
	handler: async (ctx, args): Promise<Doc<'chat'> & { messages: MessageWithAttachments[] }> => {
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

export const internalGet = internalQuery({
	args: {
		chatId: v.id('chat')
	},
	handler: async (ctx, args): Promise<Doc<'chat'> & { messages: MessageWithAttachments[] }> => {
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
		chatId: v.id('chat'),
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
		chatId: v.id('chat'),
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
		ids: v.array(v.id('chat'))
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
		chatId: v.id('chat'),
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
		chatId: v.id('chat'),
		title: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		await ctx.db.patch(args.chatId, {
			title: args.title,
			generatingTitle: false
		});
	}
});
