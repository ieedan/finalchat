import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getAll = query({
	handler: async (ctx) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return [];

		return await ctx.db
			.query('apiKeys')
			.withIndex('by_user', (q) => q.eq('userId', user.subject))
			.collect();
	}
});

export const createOrUpdate = mutation({
	args: {
		key: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return;

		const apiKey = await ctx.db
			.query('apiKeys')
			.withIndex('by_user', (q) => q.eq('userId', user.subject))
			.first();
		if (!apiKey) {
			await ctx.db.insert('apiKeys', {
				userId: user.subject,
				provider: 'OpenRouter',
				key: args.key,
				encryptionMode: 'RSA'
			});
			return;
		}

		await ctx.db.patch(apiKey._id, {
			key: args.key
		});
	}
});

export const remove = mutation({
	args: {
		id: v.id('apiKeys')
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return;

		const apiKey = await ctx.db.get(args.id);
		if (!apiKey) return;

		if (apiKey.userId !== user.subject) return;

		await ctx.db.delete(args.id);
	}
});
