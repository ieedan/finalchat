import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { authKit } from './auth';

export const get = query({
	handler: async (ctx): Promise<Doc<'apiKeys'> | null> => {
		const user = await authKit.getAuthUser(ctx);
		if (!user) return null;

		return await ctx.db
			.query('apiKeys')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', user.id))
			.first();
	}
});

export const createOrUpdate = mutation({
	args: {
		key: v.string()
	},
	handler: async (ctx, args) => {
		const user = await authKit.getAuthUser(ctx);
		if (!user) return;

		const apiKey = await ctx.db
			.query('apiKeys')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', user.id))
			.first();
		if (!apiKey) {
			await ctx.db.insert('apiKeys', {
				workosUserId: user.id,
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
		const user = await authKit.getAuthUser(ctx);
		if (!user) return;

		const apiKey = await ctx.db.get(args.id);
		if (!apiKey) return;

		if (apiKey.workosUserId !== user.id) return;

		await ctx.db.delete(args.id);
	}
});
