import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { updateUserMembership } from './auth.utils';
import { z } from 'zod';
import { authKit } from './auth';
import { internal } from './_generated/api';
import type { EventName } from '@workos-inc/node';

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

export const processEvent = internalMutation(
	async (
		ctx,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ event }: { event: { id: string; event: string; data: any; createdAt: string } }
	) => {
		switch (event.event) {
			case 'user.created': {
				await ctx.db.insert('users', {
					workosUserId: event.data.id,
					firstName: event.data.firstName,
					lastName: event.data.lastName,
					email: event.data.email,
					profilePictureUrl: event.data.profilePictureUrl
				});
				break;
			}

			case 'user.deleted': {
				const user = await ctx.db
					.query('users')
					.withIndex('by_workos_user', (q) => q.eq('workosUserId', event.data.id))
					.first();
				if (user) {
					await ctx.db.delete(user._id);
				}
				break;
			}

			case 'user.updated': {
				const user = await ctx.db
					.query('users')
					.withIndex('by_workos_user', (q) => q.eq('workosUserId', event.data.id))
					.first();
				if (user) {
					await ctx.db.patch(user._id, {
						workosUserId: event.data.id
					});
				}
				break;
			}

			case 'organization_membership.created': {
				if (event.data.status !== 'active') break;
				await updateUserMembership(ctx, {
					organizationId: event.data.organizationId,
					role: event.data.role.slug,
					userId: event.data.userId,
					membershipId: event.data.id
				});
				break;
			}

			case 'organization_membership.deleted': {
				await updateUserMembership(ctx, {
					organizationId: null,
					role: null,
					userId: event.data.userId,
					membershipId: event.data.id
				});
				break;
			}

			case 'organization_membership.updated': {
				await updateUserMembership(ctx, {
					organizationId: event.data.organizationId,
					role: event.data.role.slug,
					userId: event.data.userId,
					membershipId: event.data.id
				});
				break;
			}

			case 'invitation.created': {
				if (!event.data.organizationId || !event.data.inviterUserId) break;

				const [organization, inviter] = await Promise.all([
					authKit.workos.organizations.getOrganization(event.data.organizationId),
					authKit.workos.userManagement.getUser(event.data.inviterUserId)
				]);

				const oldInvitation = await ctx.db
					.query('invitations')
					.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', event.data.id))
					.first();
				if (oldInvitation) break;

				await ctx.db.insert('invitations', {
					status: event.data.state,
					workosInvitationId: event.data.id,
					invitedEmail: event.data.email,
					organization: {
						workosOrganizationId: event.data.organizationId,
						name: organization.name
					},
					invitedBy: {
						workosUserId: event.data.inviterUserId,
						name: `${inviter.firstName} ${inviter.lastName}`,
						email: inviter.email
					},
					expiresAt: Date.parse(event.data.expiresAt)
				});
				break;
			}

			case 'invitation.accepted': {
				const invitation = await ctx.db
					.query('invitations')
					.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', event.data.id))
					.first();

				if (invitation) {
					await ctx.db.patch(invitation._id, {
						status: 'accepted'
					});
				}
				break;
			}

			case 'invitation.revoked': {
				const invitation = await ctx.db
					.query('invitations')
					.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', event.data.id))
					.first();

				if (invitation) {
					await ctx.db.patch(invitation._id, {
						status: 'revoked',
						workosInvitationId: event.data.id
					});
				}
				break;
			}

			case 'organization.created': {
				const oldGroup = await ctx.db
					.query('groups')
					.withIndex('by_group', (q) => q.eq('workosGroupId', event.data.id))
					.first();
				if (oldGroup) break;

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

				await ctx.db.insert('groups', {
					workosGroupId: event.data.id,
					name: event.data.name,
					description: options.description,
					options: {
						canViewMembersChats: options.canViewMembersChats,
						allowPublicChats: options.allowPublicChats
					},
					key: '',
					encryptionMode: 'RSA'
				});
				break;
			}

			case 'organization.deleted': {
				const group = await ctx.db
					.query('groups')
					.withIndex('by_group', (q) => q.eq('workosGroupId', event.data.id))
					.first();
				if (group) {
					await ctx.db.delete(group._id);
				}
				break;
			}

			case 'organization.updated': {
				const group = await ctx.db
					.query('groups')
					.withIndex('by_group', (q) => q.eq('workosGroupId', event.data.id))
					.first();
				if (group) {
					await ctx.db.patch(group._id, {
						name: event.data.name
					});
				}
				break;
			}

			default:
				console.error('Unhandled event:', event.event);
				break;
		}
	}
);

/**
 * Scheduled in crons.ts
 */
export const pollEvents = internalAction(async (ctx) => {
	// Get current cursor
	const cursorDoc = await ctx.runQuery(internal.workosEvents.getCursor);

	let after: string | undefined = undefined;
	let rangeStart: string | undefined = undefined;

	// Use cursor if available, otherwise use timestamp from last 30 days
	if (cursorDoc?.cursor) {
		after = cursorDoc.cursor;
	} else if (cursorDoc?.lastProcessedAt) {
		// Use timestamp if we have one but no cursor
		rangeStart = new Date(cursorDoc.lastProcessedAt).toISOString();
	}

	try {
		const response = await authKit.workos.events.listEvents({
			events: [...EVENT_TYPES],
			after,
			rangeStart
		});

		let latestCursor: string | null = cursorDoc?.cursor || null;
		let latestProcessedAt = cursorDoc?.lastProcessedAt || Date.now();

		// Process each event sequentially
		for (const event of response.data) {
			// Process event
			await ctx.runMutation(internal.workosEvents.processEvent, { event });

			// Update cursor to this event's ID
			latestCursor = event.id;
			latestProcessedAt = Date.parse(event.createdAt);
		}

		// Update cursor after processing all events
		if (response.data.length > 0) {
			await ctx.runMutation(internal.workosEvents.updateCursor, {
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
