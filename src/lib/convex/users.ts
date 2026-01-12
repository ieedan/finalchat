import { query } from './_generated/server.js';
import { mutation } from './functions.js';
import { getUser, type User } from './users.utils.js';
import merge from 'deepmerge';
import { v } from 'convex/values';
import { DEFAULT_ENABLED_MODEL_IDS } from '../ai.js';

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
		if (!user) {
			await ctx.db.insert('users', {
				workosUserId: workosUser.subject,
				firstName: workosUser.firstName as string,
				lastName: workosUser.lastName as string,
				profilePictureUrl: workosUser.profilePictureUrl as string,
				email: workosUser.email!,
				settings: {
					onboarding: {
						mode: args.mode
					},
					// in basic mode users probably would just prefer to submit on Enter
					submitOnEnter: args.mode === 'basic',
					favoriteModelIds: DEFAULT_ENABLED_MODEL_IDS
				}
			});
			return;
		}

		await ctx.db.patch(user?._id, {
			settings: merge(user?.settings ?? {}, {
				onboarding: {
					mode: args.mode
				}
			})
		});
	}
});

export const completeSetupApiKey = mutation({
	handler: async (ctx): Promise<void> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return;

		const userSettings = await getUser(ctx, user);
		if (!userSettings) return;

		await ctx.db.patch(userSettings?._id, {
			settings: merge(userSettings.settings ?? {}, {
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

		await ctx.db.patch(user?._id, {
			settings: merge(user.settings ?? {}, {
				favoriteModelIds: Array.from(modelIdsSet)
			})
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

		await ctx.db.patch(user?._id, {
			settings: merge(user.settings ?? {}, {
				favoriteModelIds: Array.from(modelIdsSet)
			})
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
			settings: merge(user.settings ?? {}, {
				...user.settings,
				systemPrompt: args.systemPrompt
			})
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
			settings: merge(user.settings ?? {}, {
				...user.settings,
				submitOnEnter: args.submitOnEnter
			})
		});
	}
});
