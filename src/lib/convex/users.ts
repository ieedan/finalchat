import { query } from './_generated/server.js';
import { authMutation, mutation } from './functions.js';
import { getUser, type User } from './users.utils.js';
import merge from 'deepmerge';
import { v } from 'convex/values';
import { DEFAULT_ENABLED_MODEL_IDS } from '../ai.js';
import { authKit } from './auth';

const DEFAULT_SETTINGS = {
	mode: 'basic',
	submitOnEnter: true,
	favoriteModelIds: DEFAULT_ENABLED_MODEL_IDS
} as const;

export const getGroupInvites = query({
	args: {},
	handler: async (ctx) => {
		const user = await authKit.getAuthUser(ctx);
		if (!user) return null;

		const invitations = await ctx.db
			.query('invitations')
			.withIndex('by_invited', (q) => q.eq('invitedEmail', user.email ?? ''))
			.collect();

		return invitations.filter((invitation) => invitation.status === 'pending');
	}
});

export const get = query({
	handler: async (ctx): Promise<User | null> => {
		const user = await authKit.getAuthUser(ctx);
		if (!user) return null;

		return getUser(ctx, user);
	}
});

/**
 * This is here to handle the case where a user created in workos has not yet been synced to the database before the user has been redirected to the app.
 * This will create the new user so that there isn't any delay in the signup process.
 */
export const getOrSetup = mutation({
	handler: async (ctx): Promise<User | null> => {
		const user = await ctx.auth.getUserIdentity();
		console.log('basic user', user);
		const workosUser = await authKit.getAuthUser(ctx);
		console.log('workosUser', workosUser);
		if (!workosUser) return null;

		const existingUser = await getUser(ctx, workosUser);
		if (existingUser) return existingUser;

		await ctx.db.insert('users', {
			workosUserId: workosUser.id,
			firstName: workosUser.firstName ?? null,
			lastName: workosUser.lastName ?? null,
			email: workosUser.email,
			profilePictureUrl: workosUser.profilePictureUrl ?? null
		});

		return await getUser(ctx, workosUser);
	}
});

export const updateMode = authMutation({
	args: {
		mode: v.union(v.literal('basic'), v.literal('advanced'))
	},
	handler: async (ctx, args): Promise<void> => {
		if (ctx.auth.user.settings) {
			await ctx.db.patch(ctx.auth.user._id, {
				settings: {
					...ctx.auth.user.settings,
					mode: args.mode
				}
			});
			return;
		}

		await ctx.db.patch(ctx.auth.user._id, {
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

export const completeSetupApiKey = authMutation({
	handler: async (ctx): Promise<void> => {
		await ctx.db.patch(ctx.auth.user._id, {
			onboarding: merge(ctx.auth.user.onboarding ?? {}, {
				setupApiKey: true,
				completed: true
			})
		});
	}
});

export const addFavoriteModel = authMutation({
	args: {
		modelId: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		const modelIdsSet = new Set(ctx.auth.user.settings?.favoriteModelIds ?? []);
		modelIdsSet.add(args.modelId);

		await ctx.db.patch(ctx.auth.user._id, {
			settings: {
				...(ctx.auth.user.settings ?? DEFAULT_SETTINGS),
				favoriteModelIds: Array.from(modelIdsSet)
			}
		});
	}
});

export const removeFavoriteModel = authMutation({
	args: {
		modelId: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		const modelIdsSet = new Set(ctx.auth.user.settings?.favoriteModelIds ?? []);
		modelIdsSet.delete(args.modelId);

		await ctx.db.patch(ctx.auth.user._id, {
			settings: {
				...(ctx.auth.user.settings ?? DEFAULT_SETTINGS),
				favoriteModelIds: Array.from(modelIdsSet)
			}
		});
	}
});

export const updateSystemPrompt = authMutation({
	args: {
		systemPrompt: v.string()
	},
	handler: async (ctx, args): Promise<void> => {
		await ctx.db.patch(ctx.auth.user._id, {
			settings: {
				...(ctx.auth.user.settings ?? DEFAULT_SETTINGS),
				systemPrompt: args.systemPrompt
			}
		});
	}
});

export const updateSubmitOnEnter = authMutation({
	args: {
		submitOnEnter: v.boolean()
	},
	handler: async (ctx, args): Promise<void> => {
		await ctx.db.patch(ctx.auth.user._id, {
			settings: {
				...(ctx.auth.user.settings ?? DEFAULT_SETTINGS),
				submitOnEnter: args.submitOnEnter
			}
		});
	}
});
