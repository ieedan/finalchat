import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { authKit } from './auth';
import { getUser } from './users.utils';

export const get = query({
	handler: async (ctx): Promise<{ key: string; encryptionMode: 'RSA' } | null> => {
		const workosUser = await authKit.getAuthUser(ctx);
		if (!workosUser) return null;

		const user = await getUser(ctx, workosUser);
		if (!user) return null;

		if (user.membership) {
			const group = await ctx.db
				.query('groups')
				.withIndex('by_group', (q) => q.eq('workosGroupId', user.membership?.workosGroupId ?? ''))
				.first();
			if (!group) return null;

			return { key: group.key, encryptionMode: group.encryptionMode };
		}

		const apiKey = await ctx.db
			.query('apiKeys')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', user.workosUserId))
			.first();
		if (!apiKey) return null;

		return { key: apiKey.key, encryptionMode: apiKey.encryptionMode };
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
