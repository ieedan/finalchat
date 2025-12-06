import { query } from './_generated/server';
import { mutation } from './functions';
import { Doc } from './_generated/dataModel';
import { getUserSettings } from './userSettings.utils';
import merge from 'deepmerge';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx): Promise<Doc<'userSettings'> | null> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return null;

		return getUserSettings(ctx, user);
	}
});

export const updateMode = mutation({
	args: {
		mode: v.union(v.literal('basic'), v.literal('advanced'))
	},
	handler: async (ctx, args): Promise<void> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return;

		const userSettings = await getUserSettings(ctx, user);
		if (!userSettings) {
			await ctx.db.insert('userSettings', {
				userId: user.subject,
				onboarding: {
					mode: args.mode
				}
			});
			return;
		}

		await ctx.db.patch(userSettings?._id, {
			onboarding: merge(userSettings?.onboarding ?? {}, {
				mode: args.mode
			})
		});
	}
});

export const completeSetupApiKey = mutation({
	handler: async (ctx): Promise<void> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return;

		const userSettings = await getUserSettings(ctx, user);
		if (!userSettings) return;

		await ctx.db.patch(userSettings?._id, {
			onboarding: merge(userSettings.onboarding ?? {}, {
				setupApiKey: true,
				completed: true
			})
		});
	}
});
