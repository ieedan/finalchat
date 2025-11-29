import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	userSettings: defineTable({
		userId: v.string(),
		onboarding: v.optional(
			v.object({
				mode: v.optional(v.union(v.literal('basic'), v.literal('advanced'))),
                setupApiKey: v.optional(v.boolean()),
				completed: v.optional(v.boolean())
			})
		)
	}).index('by_user', ['userId']),
	apiKeys: defineTable({
		userId: v.string(),
        name: v.optional(v.string()),
		provider: v.union(v.literal('OpenRouter')),
		key: v.string(),
        encryptionMode: v.union(v.literal('RSA')),
	}).index('by_user', ['userId']),
	chat: defineTable({
		generating: v.boolean(),
		userId: v.string(),
		title: v.string()
	}).index('by_user', ['userId'])
});
