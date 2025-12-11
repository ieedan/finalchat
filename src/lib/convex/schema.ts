import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';
import { defineSchema, defineTable } from 'convex/server';
import { Infer, v } from 'convex/values';
import { Id } from './_generated/dataModel';

export const ChatMessageUser = v.object({
	chatId: v.id('chat'),
	role: v.literal('user'),
	content: v.string(),
	chatSettings: v.object({
		modelId: v.string()
	})
});

export type ChatMessageUser = Infer<typeof ChatMessageUser> & {
	_id: Id<'messages'>;
	_creationTime: number;
};

export const ChatMessageAssistant = v.object({
	chatId: v.id('chat'),
	role: v.literal('assistant'),
	content: v.optional(v.string()),
	error: v.optional(v.string()),
	streamId: StreamIdValidator,
	meta: v.object({
		modelId: v.string(),
		cost: v.optional(v.number()),
		startedGenerating: v.optional(v.number()),
		stoppedGenerating: v.optional(v.number()),
		generationId: v.optional(v.string()),
		tokenUsage: v.optional(v.number()),
		outputTokens: v.optional(v.number()),
		inputTokens: v.optional(v.number())
	})
});

export type ChatMessageAssistant = Infer<typeof ChatMessageAssistant> & {
	_id: Id<'messages'>;
	_creationTime: number;
};

export const ChatMessage = v.union(ChatMessageUser, ChatMessageAssistant);

export default defineSchema({
	userSettings: defineTable({
		userId: v.string(),
		onboarding: v.optional(
			v.object({
				mode: v.optional(v.union(v.literal('basic'), v.literal('advanced'))),
				setupApiKey: v.optional(v.boolean()),
				completed: v.optional(v.boolean())
			})
		),
		favoriteModelIds: v.array(v.string())
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
		generatingTitle: v.optional(v.boolean()),
		userId: v.string(),
		title: v.string(),
		updatedAt: v.number(),
		pinned: v.boolean(),
		branchedFrom: v.optional(
			v.object({
				chatId: v.id('chat'),
				messageId: v.id('messages')
			})
		)
	}).index('by_user', ['userId']),
	chatAttachments: defineTable({
		userId: v.string(),
		chatId: v.id('chat'),
		messageId: v.id('messages'),
		key: v.string()
	})
		.index('by_chat', ['chatId'])
		.index('by_message', ['messageId'])
		.index('by_key', ['key'])
		.index('by_user', ['userId']),
	messages: defineTable(ChatMessage).index('by_stream', ['streamId']).index('by_chat', ['chatId'])
});
