import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const ChatMessageUser = v.object({
	chatId: v.id('chat'),
	role: v.literal('user'),
	content: v.string(),
	chatSettings: v.object({
		modelId: v.string()
	})
});

export const ChatMessageAssistant = v.object({
	chatId: v.id('chat'),
	role: v.literal('assistant'),
	content: v.optional(v.string()),
	streamId: StreamIdValidator,
	meta: v.object({
		modelId: v.string(),
		cost: v.optional(v.number()),
		startedGenerating: v.optional(v.number()),
		stoppedGenerating: v.optional(v.number())
	})
});

export const ChatMessage = v.union(ChatMessageUser, ChatMessageAssistant);

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
	messages: defineTable(ChatMessage).index('by_stream', ['streamId']).index('by_chat', ['chatId'])
});
