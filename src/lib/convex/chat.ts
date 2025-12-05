import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { query } from './_generated/server';
import { getChatMessages } from './chat.utils';

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
