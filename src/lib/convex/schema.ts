import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';
import { defineSchema, defineTable } from 'convex/server';
import { type Infer, v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const ChatMessageUser = v.object({
	workosUserId: v.string(),
	chatId: v.id('chats'),
	role: v.literal('user'),
	content: v.string(),
	chatSettings: v.object({
		modelId: v.string(),
		supportedParameters: v.optional(v.array(v.string())),
		inputModalities: v.optional(v.array(v.string())),
		outputModalities: v.optional(v.array(v.string()))
	})
});

export type ChatMessageUser = Infer<typeof ChatMessageUser> & {
	_id: Id<'messages'>;
	_creationTime: number;
};

export const ChatMessageAssistant = v.object({
	chatId: v.id('chats'),
	role: v.literal('assistant'),
	content: v.optional(v.string()),
	error: v.optional(v.string()),
	streamId: StreamIdValidator,
	meta: v.object({
		modelId: v.string(),
		imageGen: v.optional(v.boolean()),
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
	users: defineTable({
		workosUserId: v.string(),
		firstName: v.union(v.string(), v.null()),
		lastName: v.union(v.string(), v.null()),
		email: v.string(),
		profilePictureUrl: v.union(v.string(), v.null()),
		settings: v.optional(
			v.object({
				mode: v.union(v.literal('basic'), v.literal('advanced')),
				favoriteModelIds: v.array(v.string()),
				systemPrompt: v.optional(v.string()),
				submitOnEnter: v.boolean()
			})
		),
		onboarding: v.optional(
			v.object({
				setupMode: v.optional(v.boolean()),
				setupApiKey: v.optional(v.boolean()),
				completed: v.optional(v.boolean())
			})
		)
	})
		.index('by_workos_user', ['workosUserId'])
		.index('by_email', ['email']),
	groups: defineTable({
		workosGroupId: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		key: v.string(),
		encryptionMode: v.union(v.literal('RSA')),
		options: v.object({
			canViewMembersChats: v.optional(v.boolean()),
			allowPublicChats: v.optional(v.boolean())
		})
	}).index('by_group', ['workosGroupId']),
	groupMembers: defineTable({
		workosGroupId: v.string(),
		workosMembershipId: v.string(),
		workosUserId: v.string(),
		role: v.string()
	})
		.index('by_workos_group', ['workosGroupId'])
		.index('by_workos_membership', ['workosMembershipId'])
		.index('by_workos_user', ['workosUserId']),
	invitations: defineTable({
		workosInvitationId: v.string(),
		invitedEmail: v.string(),
		status: v.union(
			v.literal('pending'),
			v.literal('accepted'),
			v.literal('revoked'),
			v.literal('expired')
		),
		organization: v.object({
			workosOrganizationId: v.string(),
			name: v.string()
		}),
		invitedBy: v.object({
			workosUserId: v.string(),
			name: v.string(),
			email: v.string()
		}),
		expiresAt: v.number()
	})
		.index('by_workos_invitation', ['workosInvitationId'])
		.index('by_invited', ['invitedEmail'])
		.index('by_organization', ['organization.workosOrganizationId']),
	apiKeys: defineTable({
		workosUserId: v.optional(v.string()),
		workosGroupId: v.optional(v.string()),
		name: v.optional(v.string()),
		provider: v.union(v.literal('OpenRouter')),
		key: v.string(),
		encryptionMode: v.union(v.literal('RSA'))
	})
		.index('by_workos_user', ['workosUserId'])
		.index('by_workos_group', ['workosGroupId']),
	chats: defineTable({
		generating: v.boolean(),
		generatingTitle: v.optional(v.boolean()),
		workosUserId: v.string(),
		workosGroupId: v.optional(v.string()),
		groupId: v.optional(v.id('groups')),
		title: v.string(),
		updatedAt: v.number(),
		pinned: v.boolean(),
		branchedFrom: v.optional(
			v.object({
				chatId: v.id('chats'),
				messageId: v.id('messages')
			})
		),
		public: v.optional(v.boolean())
	})
		.index('by_workos_user', ['workosUserId'])
		.index('by_workos_group', ['workosGroupId']),
	chatAttachments: defineTable({
		workosUserId: v.string(),
		workosGroupId: v.optional(v.string()),
		chatId: v.id('chats'),
		messageId: v.id('messages'),
		key: v.string(),
		mediaType: v.string()
	})
		.index('by_chat', ['chatId'])
		.index('by_message', ['messageId'])
		.index('by_key', ['key'])
		.index('by_workos_user', ['workosUserId'])
		.index('by_workos_group', ['workosGroupId']),
	messages: defineTable(ChatMessage).index('by_stream', ['streamId']).index('by_chat', ['chatId'])
});
