import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { mutation } from './functions';
import { getChatMessages } from './chat.utils';
import { query } from './_generated/server';

export const getAll = query({
	args: {},
	handler: async (ctx): Promise<Doc<'chat'>[]> => {
		const user = await ctx.auth.getUserIdentity();

		if (!user) return [];

		return await ctx.db
			.query('chat')
			.withIndex('by_user', (q) => q.eq('userId', user.subject))
			.collect();
	}
});

export const get = query({
	args: {
		chatId: v.id('chat')
	},
	handler: async (ctx, args): Promise<Doc<'chat'> & { messages: Doc<'messages'>[] }> => {
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