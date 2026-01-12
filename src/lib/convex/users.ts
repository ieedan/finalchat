import { query } from './_generated/server.js';
import { mutation } from './functions.js';
import { getUser, type User } from './users.utils.js';
import merge from 'deepmerge';
import { v } from 'convex/values';
import { DEFAULT_ENABLED_MODEL_IDS } from '../ai.js';

const DEFAULT_SETTINGS = {
	mode: 'basic',
	submitOnEnter: true,
	favoriteModelIds: DEFAULT_ENABLED_MODEL_IDS
} as const;

export const getGroupInvites = query({
	args: {},
	handler: async (ctx) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return null;

		const invitations = await ctx.db
			.query('invitations')
			.withIndex('by_invited', (q) => q.eq('invitedEmail', user.email ?? ''))
			.collect();

		return invitations.filter((invitation) => invitation.status === 'pending');
	}
});

export const get = query({
	args: {},
	handler: async (ctx): Promise<User | null> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return null;

		return getUser(ctx, user);
	}
});

export const updateMode = mutation({
	args: {
		mode: v.union(v.literal('basic'), v.literal('advanced'))
	},
	handler: async (ctx, args): Promise<void> => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) return;

		const user = await getUser(ctx, workosUser);
		if (!user) return;

		if (user.settings) {
			await ctx.db.patch(user?._id, {
				settings: {
					...user.settings,
					mode: args.mode
				}
			});
			return;
		}

		await ctx.db.patch(user._id, {
			settings: {
				mode: args.mode,
				favoriteModelIds: DEFAULT_ENABLED_MODEL_IDS,
				submitOnEnter: args.mode === 'basic'
			},
			onboarding: {
				setupMode: true
			}
		});
	}
});

export const completeSetupApiKey = mutation({
	handler: async (ctx): Promise<void> => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) return;

		const user = await getUser(ctx, workosUser);
		if (!user) return;

		await ctx.db.patch(user._id, {
			onboarding: merge(user.onboarding ?? {}, {
				setupApiKey: true,
				completed: true
			})
		});
	}
});

export const addFavoriteModel = mutation({
	args: {
		modelId: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) return;

		const user = await getUser(ctx, workosUser);
		if (!user) return;

		const modelIdsSet = new Set(user.settings?.favoriteModelIds ?? []);
		modelIdsSet.add(args.modelId);

		await ctx.db.patch(user._id, {
			settings: {
				...(user.settings ?? DEFAULT_SETTINGS),
				favoriteModelIds: Array.from(modelIdsSet)
			}
		});
	}
});

export const removeFavoriteModel = mutation({
	args: {
		modelId: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) return;

		const user = await getUser(ctx, workosUser);
		if (!user) return;

		const modelIdsSet = new Set(user.settings?.favoriteModelIds ?? []);
		modelIdsSet.delete(args.modelId);

		await ctx.db.patch(user._id, {
			settings: {
				...(user.settings ?? DEFAULT_SETTINGS),
				favoriteModelIds: Array.from(modelIdsSet)
			}
		});
	}
});

export const updateSystemPrompt = mutation({
	args: {
		systemPrompt: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) return;

		const user = await getUser(ctx, workosUser);
		if (!user) return;

		await ctx.db.patch(user?._id, {
			settings: {
				...(user.settings ?? DEFAULT_SETTINGS),
				systemPrompt: args.systemPrompt
			}
		});
	}
});

export const updateSubmitOnEnter = mutation({
	args: {
		submitOnEnter: v.boolean()
	},
	handler: async (ctx, args): Promise<void> => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) return;

		const user = await getUser(ctx, workosUser);
		if (!user) return;

		await ctx.db.patch(user?._id, {
			settings: {
				...(user.settings ?? DEFAULT_SETTINGS),
				submitOnEnter: args.submitOnEnter
			}
		});
	}
});
