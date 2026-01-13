import { internalAction, internalQuery } from './_generated/server';
import { internalMutation } from './functions';
import { z } from 'zod';
import { authKit } from './auth';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import type { EventName, Organization, User } from '@workos-inc/node';
import { env } from '../env.convex';

const EVENT_TYPES: EventName[] = [
	'user.created',
	'user.updated',
	'user.deleted',
	'organization_membership.created',
	'organization_membership.updated',
	'organization_membership.deleted',
	'invitation.created',
	'invitation.accepted',
	'invitation.revoked',
	'organization.created',
	'organization.updated',
	'organization.deleted'
] as const;

export const getCursor = internalQuery({
	handler: async (ctx) => {
		const cursor = await ctx.db.query('eventCursor').first();
		return cursor;
	}
});

export const updateCursor = internalMutation(
	async (ctx, { cursor, lastProcessedAt }: { cursor: string | null; lastProcessedAt: number }) => {
		const existing = await ctx.db.query('eventCursor').first();

		if (existing) {
			await ctx.db.patch(existing._id, { cursor, lastProcessedAt });
		} else {
			await ctx.db.insert('eventCursor', { cursor, lastProcessedAt });
		}
	}
);

export const processEvent = internalAction(
	async (
		ctx,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ event }: { event: { id: string; event: string; data: any; createdAt: string } }
	) => {
		switch (event.event) {
			case 'user.created': {
				await ctx.runMutation(internal.workos.processUserCreated, {
					id: event.data.id,
					firstName: event.data.firstName,
					lastName: event.data.lastName,
					email: event.data.email,
					profilePictureUrl: event.data.profilePictureUrl
				});
				break;
			}

			case 'user.deleted': {
				await ctx.runMutation(internal.workos.processUserDeleted, {
					id: event.data.id
				});
				break;
			}

			case 'user.updated': {
				await ctx.runMutation(internal.workos.processUserUpdated, {
					id: event.data.id
				});
				break;
			}

			case 'organization_membership.created': {
				if (event.data.status !== 'active') break;
				await ctx.runMutation(internal.workos.processOrganizationMembershipCreated, {
					organizationId: event.data.organizationId,
					role: event.data.role.slug,
					userId: event.data.userId,
					membershipId: event.data.id
				});
				break;
			}

			case 'organization_membership.deleted': {
				await ctx.runMutation(internal.workos.processOrganizationMembershipDeleted, {
					userId: event.data.userId,
					membershipId: event.data.id
				});
				break;
			}

			case 'organization_membership.updated': {
				await ctx.runMutation(internal.workos.processOrganizationMembershipUpdated, {
					organizationId: event.data.organizationId,
					role: event.data.role.slug,
					userId: event.data.userId,
					membershipId: event.data.id
				});
				break;
			}

			case 'invitation.created': {
				if (!event.data.organizationId || !event.data.inviterUserId) break;

				let organization: Organization | undefined;
				let inviter: User | undefined;
				try {
					[organization, inviter] = await Promise.all([
						authKit.workos.organizations.getOrganization(event.data.organizationId),
						authKit.workos.userManagement.getUser(event.data.inviterUserId)
					]);
				} catch {
					break;
				}

				await ctx.runMutation(internal.workos.processInvitationCreated, {
					workosInvitationId: event.data.id,
					invitedEmail: event.data.email,
					status: event.data.state,
					expiresAt: event.data.expiresAt,
					organizationId: event.data.organizationId,
					organizationName: organization.name,
					inviterUserId: event.data.inviterUserId,
					inviterName: `${inviter.firstName} ${inviter.lastName}`,
					inviterEmail: inviter.email
				});
				break;
			}

			case 'invitation.accepted': {
				await ctx.runMutation(internal.workos.processInvitationAccepted, {
					workosInvitationId: event.data.id
				});
				break;
			}

			case 'invitation.revoked': {
				await ctx.runMutation(internal.workos.processInvitationRevoked, {
					workosInvitationId: event.data.id
				});
				break;
			}

			case 'organization.created': {
				const MetaDataSchema = z.object({
					canViewMembersChats: z
						.union([z.literal('true'), z.literal('false')])
						.transform((val) => val === 'true')
						.default(false),
					allowPublicChats: z
						.union([z.literal('true'), z.literal('false')])
						.transform((val) => val === 'true')
						.default(true),
					description: z.string().optional()
				});

				const options = MetaDataSchema.parse(event.data.metadata || {});

				await ctx.runMutation(internal.workos.processOrganizationCreated, {
					id: event.data.id,
					name: event.data.name,
					description: options.description,
					canViewMembersChats: options.canViewMembersChats,
					allowPublicChats: options.allowPublicChats
				});
				break;
			}

			case 'organization.deleted': {
				await ctx.runMutation(internal.workos.processOrganizationDeleted, {
					id: event.data.id
				});
				break;
			}

			case 'organization.updated': {
				await ctx.runMutation(internal.workos.processOrganizationUpdated, {
					id: event.data.id,
					name: event.data.name
				});
				break;
			}

			default:
				console.error('Unhandled event:', event.event);
				break;
		}
	}
);

export const processUserCreated = internalMutation({
	args: {
		id: v.string(),
		firstName: v.union(v.string(), v.null()),
		lastName: v.union(v.string(), v.null()),
		email: v.string(),
		profilePictureUrl: v.union(v.string(), v.null())
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', args.id))
			.first();
		if (user) {
			await ctx.db.patch(user._id, {
				firstName: args.firstName,
				lastName: args.lastName,
				email: args.email,
				profilePictureUrl: args.profilePictureUrl
			});
		} else {
			await ctx.db.insert('users', {
				workosUserId: args.id,
				firstName: args.firstName,
				lastName: args.lastName,
				email: args.email,
				profilePictureUrl: args.profilePictureUrl
			});
		}
	}
});

export const processUserDeleted = internalMutation({
	args: {
		id: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', args.id))
			.first();
		if (user) {
			await ctx.db.delete(user._id);
		}
	}
});

export const processUserUpdated = internalMutation({
	args: {
		id: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', args.id))
			.first();
		if (user) {
			await ctx.db.patch(user._id, {
				workosUserId: args.id
			});
		}
	}
});

export const processOrganizationMembershipCreated = internalMutation({
	args: {
		organizationId: v.string(),
		role: v.string(),
		userId: v.string(),
		membershipId: v.string()
	},
	handler: async (ctx, args) => {
		const membership = await ctx.db
			.query('groupMembers')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', args.userId))
			.first();
		if (membership) {
			await ctx.db.patch(membership._id, {
				workosGroupId: args.organizationId,
				role: args.role
			});
		} else {
			await ctx.db.insert('groupMembers', {
				workosGroupId: args.organizationId,
				workosMembershipId: args.membershipId,
				workosUserId: args.userId,
				role: args.role
			});
		}
	}
});

export const processOrganizationMembershipDeleted = internalMutation({
	args: {
		userId: v.string(),
		membershipId: v.string()
	},
	handler: async (ctx, args) => {
		const membership = await ctx.db
			.query('groupMembers')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', args.userId))
			.first();
		if (membership) {
			await ctx.db.delete(membership._id);
		}
	}
});

export const processOrganizationMembershipUpdated = internalMutation({
	args: {
		organizationId: v.string(),
		role: v.string(),
		userId: v.string(),
		membershipId: v.string()
	},
	handler: async (ctx, args) => {
		const membership = await ctx.db
			.query('groupMembers')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', args.userId))
			.first();
		if (membership) {
			await ctx.db.patch(membership._id, {
				workosGroupId: args.organizationId,
				role: args.role
			});
		} else {
			await ctx.db.insert('groupMembers', {
				workosGroupId: args.organizationId,
				workosMembershipId: args.membershipId,
				workosUserId: args.userId,
				role: args.role
			});
		}
	}
});

export const processInvitationCreated = internalMutation({
	args: {
		workosInvitationId: v.string(),
		invitedEmail: v.string(),
		status: v.union(
			v.literal('pending'),
			v.literal('accepted'),
			v.literal('revoked'),
			v.literal('expired')
		),
		expiresAt: v.string(),
		organizationId: v.string(),
		organizationName: v.string(),
		inviterUserId: v.string(),
		inviterName: v.string(),
		inviterEmail: v.string()
	},
	handler: async (ctx, args) => {
		const oldInvitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', args.workosInvitationId))
			.first();
		if (oldInvitation) return;

		await ctx.db.insert('invitations', {
			status: args.status,
			workosInvitationId: args.workosInvitationId,
			invitedEmail: args.invitedEmail,
			organization: {
				workosOrganizationId: args.organizationId,
				name: args.organizationName
			},
			invitedBy: {
				workosUserId: args.inviterUserId,
				name: args.inviterName,
				email: args.inviterEmail
			},
			expiresAt: Date.parse(args.expiresAt)
		});
	}
});

export const processInvitationAccepted = internalMutation({
	args: {
		workosInvitationId: v.string()
	},
	handler: async (ctx, args) => {
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', args.workosInvitationId))
			.first();

		if (invitation) {
			await ctx.db.patch(invitation._id, {
				status: 'accepted'
			});
		}
	}
});

export const processInvitationRevoked = internalMutation({
	args: {
		workosInvitationId: v.string()
	},
	handler: async (ctx, args) => {
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', args.workosInvitationId))
			.first();

		if (invitation) {
			await ctx.db.patch(invitation._id, {
				status: 'revoked',
				workosInvitationId: args.workosInvitationId
			});
		}
	}
});

export const processOrganizationCreated = internalMutation({
	args: {
		id: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		canViewMembersChats: v.optional(v.boolean()),
		allowPublicChats: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const oldGroup = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', args.id))
			.first();
		if (oldGroup) return;

		await ctx.db.insert('groups', {
			workosGroupId: args.id,
			name: args.name,
			description: args.description,
			options: {
				canViewMembersChats: args.canViewMembersChats ?? false,
				allowPublicChats: args.allowPublicChats ?? true
			},
			key: '',
			encryptionMode: 'RSA'
		});
	}
});

export const processOrganizationDeleted = internalMutation({
	args: {
		id: v.string()
	},
	handler: async (ctx, args) => {
		const group = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', args.id))
			.first();
		if (group) {
			await ctx.db.delete(group._id);
		}
	}
});

export const processOrganizationUpdated = internalMutation({
	args: {
		id: v.string(),
		name: v.string()
	},
	handler: async (ctx, args) => {
		const group = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', args.id))
			.first();
		if (group) {
			await ctx.db.patch(group._id, {
				name: args.name
			});
		}
	}
});

/**
 * Scheduled in crons.ts
 */
export const pollEvents = internalAction(async (ctx) => {
	// Get current cursor
	const cursor = await ctx.runQuery(internal.workos.getCursor);

	// don't start polling events until data sync has been completed in pre-production environments
	// this will prevent issues where we have conflicting updates because it will wait to start polling until the data sync has completed and updated the cursor
	const isProduction = env.CONVEX_CLOUD_URL === 'https://rightful-grouse-394.convex.cloud';
	if (isProduction && cursor === null) {
		return;
	}

	let after: string | undefined = undefined;
	let rangeStart: string | undefined = undefined;

	if (cursor?.cursor) {
		after = cursor.cursor;
	} else if (cursor?.lastProcessedAt) {
		// Use timestamp if we have one but no cursor
		rangeStart = new Date(cursor.lastProcessedAt).toISOString();
	}

	try {
		const response = await authKit.workos.events.listEvents({
			events: [...EVENT_TYPES],
			after,
			rangeStart
		});

		let latestCursor: string | null = cursor?.cursor || null;
		let latestProcessedAt = cursor?.lastProcessedAt || Date.now();

		// Process each event sequentially
		for (const event of response.data) {
			// Process event
			await ctx.runAction(internal.workos.processEvent, { event });

			// Update cursor to this event's ID
			latestCursor = event.id;
			latestProcessedAt = Date.parse(event.createdAt);
		}

		// Update cursor after processing all events
		if (response.data.length > 0) {
			await ctx.runMutation(internal.workos.updateCursor, {
				cursor: latestCursor,
				lastProcessedAt: latestProcessedAt
			});
		}

		return {
			processed: response.data.length,
			hasMore: !!response.listMetadata?.after
		};
	} catch (error) {
		console.error('Error polling WorkOS events:', error);
		throw error;
	}
});
