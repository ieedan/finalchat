import { AuthKit, type AuthFunctions } from '@convex-dev/workos-authkit';
import { components, internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { env } from '../env.convex';
import z from 'zod';
import { updateUserMembership } from './auth.utils';

const authFunctions: AuthFunctions = internal.auth;

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
	authFunctions,
	additionalEventTypes: [
		'organization_membership.created',
		'organization_membership.updated',
		'organization_membership.deleted',
		'invitation.accepted',
		'invitation.created',
		'invitation.revoked',
		'organization.created',
		'organization.deleted',
		'organization.updated'
	],
	clientId: env.WORKOS_CLIENT_ID,
	apiKey: env.WORKOS_API_KEY,
	webhookSecret: env.WORKOS_WEBHOOK_SECRET
});

export const { authKitEvent } = authKit.events({
	'organization_membership.created': async (ctx, event) => {
		if (event.data.status !== 'active') return;
		await updateUserMembership(ctx, {
			organizationId: event.data.organizationId,
			role: event.data.role.slug,
			userId: event.data.userId,
			membershipId: event.data.id
		});
	},
	'organization_membership.deleted': async (ctx, event) => {
		await updateUserMembership(ctx, {
			organizationId: null,
			role: null,
			userId: event.data.userId,
			membershipId: event.data.id
		});
	},
	'organization_membership.updated': async (ctx, event) => {
		await updateUserMembership(ctx, {
			organizationId: event.data.organizationId,
			role: event.data.role.slug,
			userId: event.data.userId,
			membershipId: event.data.id
		});
	},
	'invitation.created': async (ctx, event) => {
		if (!event.data.organizationId || !event.data.inviterUserId) return;
		const [organization, inviter] = await Promise.all([
			authKit.workos.organizations.getOrganization(event.data.organizationId),
			authKit.workos.userManagement.getUser(event.data.inviterUserId)
		]);

		// this is possible because we sync the invitation with convex when creating it instead of waiting for the webhook
		const oldInvitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', event.data.id))
			.first();
		if (oldInvitation) return;

		await ctx.db.insert('invitations', {
			status: event.data.state,
			workosInvitationId: event.data.id,
			invitedEmail: event.data.email,
			organization: {
				id: event.data.organizationId,
				name: organization.name
			},
			invitedBy: {
				id: event.data.inviterUserId,
				name: `${inviter.firstName} ${inviter.lastName}`,
				email: inviter.email
			},
			expiresAt: Date.parse(event.data.expiresAt)
		});
	},
	'invitation.accepted': async (ctx, event) => {
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', event.data.id))
			.first();

		if (!invitation) return;

		await ctx.db.patch(invitation._id, {
			status: 'accepted'
		});
	},
	'invitation.revoked': async (ctx, event) => {
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', event.data.id))
			.first();

		if (!invitation) return;

		await ctx.db.patch(invitation._id, {
			status: 'revoked',
			workosInvitationId: event.data.id
		});
	},
	'organization.created': async (ctx, event) => {
		// this is possible because we sync the group with convex when creating it instead of waiting for the webhook
		const oldGroup = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', event.data.id))
			.first();
		if (oldGroup) return;

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

		const options = MetaDataSchema.parse(event.data.metadata);

		await ctx.db.insert('groups', {
			workosGroupId: event.data.id,
			name: event.data.name,
			description: options.description,
			options: options
		});
	},
	'organization.deleted': async (ctx, event) => {
		const group = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', event.data.id))
			.first();
		if (!group) return;

		await ctx.db.delete(group._id);
	},
	'organization.updated': async (ctx, event) => {
		const group = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', event.data.id))
			.first();
		if (!group) return;

		await ctx.db.patch(group._id, {
			name: event.data.name
		});
	}
});


