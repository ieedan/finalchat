import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	userSettings: defineTable({
		userId: v.string(),
		modelId: v.optional(v.string()),
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
		encryptionMode: v.union(v.literal('RSA'))
	}).index('by_user', ['userId']),
	chat: defineTable({
		generating: v.boolean(),
		userId: v.string(),
		title: v.optional(v.string())
	}).index('by_user', ['userId']),
	messages: defineTable({
		userId: v.string(),
		chatId: v.id('chat'),
		role: v.union(v.literal('user'), v.literal('assistant')),
		content: v.optional(v.string()),
		modelId: v.optional(v.string()),
		streamId: v.optional(StreamIdValidator)
	})
		.index('by_stream', ['streamId'])
		.index('by_chat', ['chatId'])
});
