import { Doc } from './_generated/dataModel';
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
