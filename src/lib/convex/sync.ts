/**
 * Handles any data sync for preview environments
 */

import { v } from 'convex/values';
import { internalAction } from './_generated/server';
import { authKit } from './auth';
import { internalMutation } from './functions';
import { internal } from './_generated/api';

/**
 * Syncs data from Workos into the corresponding convex tables (only in preview)
 */
export const workos = internalAction(async (ctx) => {
	const workosUsers = await authKit.workos.userManagement.listUsers();

	for (const workosUser of workosUsers.data) {
		await ctx.runMutation(internal.sync.syncWorkosUser, {
			id: workosUser.id,
			firstName: workosUser.firstName,
			lastName: workosUser.lastName,
			email: workosUser.email,
			profilePictureUrl: workosUser.profilePictureUrl
		});
	}

	const workosGroups = await authKit.workos.organizations.listOrganizations();

	for (const workosGroup of workosGroups.data) {
		await ctx.runMutation(internal.sync.syncWorkosGroup, {
			id: workosGroup.id,
			name: workosGroup.name,
			description: workosGroup.metadata?.description,
			canViewMembersChats: workosGroup.metadata?.canViewMembersChats === 'true',
			allowPublicChats: workosGroup.metadata?.allowPublicChats === 'true'
		});

		const workosGroupMemberships = await authKit.workos.userManagement.listOrganizationMemberships({
			organizationId: workosGroup.id
		});

		for (const workosGroupMembership of workosGroupMemberships.data) {
			await ctx.runMutation(internal.sync.syncWorkosGroupMembership, {
				workosGroupId: workosGroupMembership.organizationId,
				workosMembershipId: workosGroupMembership.id,
				workosUserId: workosGroupMembership.userId,
				role: workosGroupMembership.role.slug
			});
		}
	}

	const workosInvitations = await authKit.workos.userManagement.listInvitations({});

	for (const workosInvitation of workosInvitations.data) {
		if (!workosInvitation.inviterUserId || !workosInvitation.organizationId) continue;

		const [inviter, organization] = await Promise.all([
			authKit.workos.userManagement.getUser(workosInvitation.inviterUserId),
			authKit.workos.organizations.getOrganization(workosInvitation.organizationId)
		]);
		if (!inviter || !organization) continue;

		await ctx.runMutation(internal.sync.syncWorkosInvitation, {
			workosInvitationId: workosInvitation.id,
			invitedEmail: workosInvitation.email,
			status: workosInvitation.state,
			expiresAt: Date.parse(workosInvitation.expiresAt),
			inviterUserId: workosInvitation.inviterUserId,
			inviterName: `${inviter.firstName} ${inviter.lastName}`,
			inviterEmail: inviter.email,
			organizationId: workosInvitation.organizationId,
			organizationName: organization.name
		});
	}

	// Set cursor to current time after sync completes
	await ctx.runMutation(internal.workos.updateCursor, {
		cursor: null,
		lastProcessedAt: Date.now()
	});
});

export const syncWorkosUser = internalMutation({
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

export const syncWorkosGroup = internalMutation({
	args: {
		id: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		canViewMembersChats: v.optional(v.boolean()),
		allowPublicChats: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const group = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', args.id))
			.first();
		if (group) {
			await ctx.db.patch(group._id, {
				name: args.name,
				description: args.description,
				options: {
					canViewMembersChats: args.canViewMembersChats ?? false,
					allowPublicChats: args.allowPublicChats ?? true
				}
			});
		} else {
			await ctx.db.insert('groups', {
				workosGroupId: args.id,
				name: args.name,
				description: args.description ?? '',
				options: {
					canViewMembersChats: args.canViewMembersChats ?? false,
					allowPublicChats: args.allowPublicChats ?? true
				},
				encryptionMode: 'RSA',
				key: ''
			});
		}
	}
});

export const syncWorkosGroupMembership = internalMutation({
	args: {
		workosGroupId: v.string(),
		workosMembershipId: v.string(),
		workosUserId: v.string(),
		role: v.string()
	},
	handler: async (ctx, args) => {
		const groupMembership = await ctx.db
			.query('groupMembers')
			.withIndex('by_workos_membership', (q) => q.eq('workosMembershipId', args.workosMembershipId))
			.first();
		if (groupMembership) {
			await ctx.db.patch(groupMembership._id, {
				workosGroupId: args.workosGroupId,
				workosUserId: args.workosUserId,
				role: args.role
			});
		} else {
			await ctx.db.insert('groupMembers', {
				workosGroupId: args.workosGroupId,
				workosMembershipId: args.workosMembershipId,
				workosUserId: args.workosUserId,
				role: args.role
			});
		}
	}
});

export const syncWorkosInvitation = internalMutation({
	args: {
		workosInvitationId: v.string(),
		invitedEmail: v.string(),
		status: v.union(
			v.literal('pending'),
			v.literal('accepted'),
			v.literal('revoked'),
			v.literal('expired')
		),
		expiresAt: v.number(),
		inviterUserId: v.string(),
		inviterName: v.string(),
		inviterEmail: v.string(),
		organizationId: v.string(),
		organizationName: v.string()
	},
	handler: async (ctx, args) => {
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', args.workosInvitationId))
			.first();
		if (invitation) {
			await ctx.db.patch(invitation._id, {
				invitedEmail: args.invitedEmail,
				status: args.status,
				expiresAt: args.expiresAt,
				invitedBy: {
					workosUserId: args.inviterUserId,
					name: args.inviterName,
					email: args.inviterEmail
				},
				organization: {
					workosOrganizationId: args.organizationId,
					name: args.organizationName
				}
			});
		} else {
			await ctx.db.insert('invitations', {
				workosInvitationId: args.workosInvitationId,
				invitedEmail: args.invitedEmail,
				status: args.status,
				expiresAt: args.expiresAt,
				invitedBy: {
					workosUserId: args.inviterUserId,
					name: args.inviterName,
					email: args.inviterEmail
				},
				organization: {
					workosOrganizationId: args.organizationId,
					name: args.organizationName
				}
			});
		}
	}
});
