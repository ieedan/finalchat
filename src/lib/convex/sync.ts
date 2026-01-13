/**
 * Handles any data sync for preview environments
 */

import { authKit } from './auth';
import { internalMutation } from './functions';

/**
 * Syncs data from Workos into the corresponding convex tables (only in preview)
 */
export const workos = internalMutation(async (ctx) => {
	const workosUsers = await authKit.workos.userManagement.listUsers();

	for (const workosUser of workosUsers.data) {
		const user = await ctx.db
			.query('users')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', workosUser.id))
			.first();
		if (user) {
			await ctx.db.patch(user._id, {
				firstName: workosUser.firstName,
				lastName: workosUser.lastName,
				email: workosUser.email,
				profilePictureUrl: workosUser.profilePictureUrl
			});
		} else {
			await ctx.db.insert('users', {
				workosUserId: workosUser.id,
				firstName: workosUser.firstName,
				lastName: workosUser.lastName,
				email: workosUser.email,
				profilePictureUrl: workosUser.profilePictureUrl
			});
		}
	}

	const workosGroups = await authKit.workos.organizations.listOrganizations();

	for (const workosGroup of workosGroups.data) {
		const group = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', workosGroup.id))
			.first();

		if (group) {
			await ctx.db.patch(group._id, {
				name: workosGroup.name,
				description: workosGroup.metadata.description,
				options: {
					canViewMembersChats: workosGroup.metadata.canViewMembersChats === 'true',
					allowPublicChats: workosGroup.metadata.allowPublicChats === 'true'
				}
			});
		} else {
			await ctx.db.insert('groups', {
				workosGroupId: workosGroup.id,
				name: workosGroup.name,
				description: workosGroup.metadata.description,
				options: {
					canViewMembersChats: workosGroup.metadata.canViewMembersChats === 'true',
					allowPublicChats: workosGroup.metadata.allowPublicChats === 'true'
				},
				encryptionMode: 'RSA',
				key: ''
			});
		}
	}

	const workosGroupMemberships = await authKit.workos.userManagement.listOrganizationMemberships(
		{}
	);

	for (const workosGroupMembership of workosGroupMemberships.data) {
		const groupMembership = await ctx.db
			.query('groupMembers')
			.withIndex('by_workos_membership', (q) =>
				q.eq('workosMembershipId', workosGroupMembership.id)
			)
			.first();

		if (groupMembership) {
			await ctx.db.patch(groupMembership._id, {
				role: workosGroupMembership.role.slug
			});
		} else {
			await ctx.db.insert('groupMembers', {
				workosGroupId: workosGroupMembership.organizationId,
				workosMembershipId: workosGroupMembership.id,
				workosUserId: workosGroupMembership.userId,
				role: workosGroupMembership.role.slug
			});
		}
	}

	const workosInvitations = await authKit.workos.userManagement.listInvitations({});

	for (const workosInvitation of workosInvitations.data) {
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_workos_invitation', (q) => q.eq('workosInvitationId', workosInvitation.id))
			.first();

		if (!workosInvitation.inviterUserId || !workosInvitation.organizationId) continue;

		const [inviter, organization] = await Promise.all([
			authKit.workos.userManagement.getUser(workosInvitation.inviterUserId),
			authKit.workos.organizations.getOrganization(workosInvitation.organizationId)
		]);
		if (!inviter || !organization) continue;

		if (invitation) {
			await ctx.db.patch(invitation._id, {
				status: workosInvitation.state
			});
		} else {
			await ctx.db.insert('invitations', {
				workosInvitationId: workosInvitation.id,
				invitedEmail: workosInvitation.email,
				expiresAt: Date.parse(workosInvitation.expiresAt),
				invitedBy: {
					workosUserId: workosInvitation.inviterUserId,
					name: `${inviter.firstName} ${inviter.lastName}`,
					email: inviter.email
				},
				organization: {
					workosOrganizationId: workosInvitation.organizationId,
					name: organization.name
				},
				status: workosInvitation.state
			});
		}
	}
});
