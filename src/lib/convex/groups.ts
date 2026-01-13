import { v } from 'convex/values';
import { query } from './_generated/server';
import { authAction, authMutation, internalMutation } from './functions';
import { authKit } from './auth';
import { updateUserMembership } from './auth.utils';
import { internal } from './_generated/api';
import { asyncMap } from 'convex-helpers';

export const getGroup = query({
	args: {
		groupId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		if (!args.groupId) return null;
		const user = await authKit.getAuthUser(ctx);
		if (!user) return null;

		const [group, groupMembers] = await Promise.all([
			ctx.db
				.query('groups')
				.withIndex('by_group', (q) => q.eq('workosGroupId', args.groupId ?? ''))
				.first(),
			asyncMap(
				ctx.db
					.query('groupMembers')
					.withIndex('by_workos_group', (q) => q.eq('workosGroupId', args.groupId ?? ''))
					.collect(),
				async (member) => {
					const user = await ctx.db
						.query('users')
						.withIndex('by_workos_user', (q) => q.eq('workosUserId', member.workosUserId))
						.first();
					if (!user) return null;
					return {
						...user,
						role: member.role
					};
				}
			)
		]);

		return {
			...group,
			members: groupMembers.filter((member) => member !== null)
		};
	}
});

export const createGroup = authAction({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		canViewMembersChats: v.boolean(),
		allowPublicChats: v.boolean(),
		apiKeyEncrypted: v.string()
	},
	handler: async (ctx, args) => {
		if (ctx.auth.user.membership) throw new Error('User already belongs to a group');

		const workosGroup = await authKit.workos.organizations.createOrganization({
			name: args.name,
			metadata: {
				description: args.description ?? '',
				canViewMembersChats: args.canViewMembersChats ? 'true' : 'false',
				allowPublicChats: args.allowPublicChats ? 'true' : 'false'
			}
		});
		const membership = await authKit.workos.userManagement.createOrganizationMembership({
			organizationId: workosGroup.id,
			userId: ctx.auth.user.workosUserId,
			roleSlug: 'admin'
		});

		// sync with convex ASAP if webhooks are different they can simply overwrite
		await Promise.all([
			ctx.runMutation(internal.groups.internalCreateGroup, {
				workosGroupId: workosGroup.id,
				name: workosGroup.name,
				description: args.description ?? '',
				canViewMembersChats: args.canViewMembersChats,
				allowPublicChats: args.allowPublicChats,
				apiKeyEncrypted: args.apiKeyEncrypted
			}),
			ctx.runMutation(internal.groups.internalUpdateUserMembership, {
				userId: ctx.auth.user.workosUserId,
				organizationId: workosGroup.id,
				membershipId: membership.id,
				role: 'admin'
			})
		]);
	}
});

export const leaveGroup = authAction({
	handler: async (ctx) => {
		if (!ctx.auth.user.membership) throw new Error('User is not a member of a group');

		// TODO: handle how to deal with the group if an admin user leaves

		await authKit.workos.userManagement.deleteOrganizationMembership(
			ctx.auth.user.membership.workosMembershipId
		);

		const orgMembers = await authKit.workos.userManagement.listOrganizationMemberships({
			organizationId: ctx.auth.user.membership.workosGroupId
		});

		let organizationDeletionPromise: Promise<void> | null = null;
		if (
			orgMembers.data.filter((member) => member.status === 'active' && member.role.slug === 'admin')
				.length === 0
		) {
			// if there are no more admin users, delete the group
			organizationDeletionPromise = authKit.workos.organizations.deleteOrganization(
				ctx.auth.user.membership.workosGroupId
			);
		}

		await ctx.runMutation(internal.groups.internalUpdateUserMembership, {
			userId: ctx.auth.user.workosUserId,
			membershipId: ctx.auth.user.membership.workosMembershipId,
			organizationId: null,
			role: null
		});

		if (organizationDeletionPromise) await organizationDeletionPromise;
	}
});

export const updateGroupApiKey = authMutation({
	args: {
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		if (!ctx.auth.user.membership) throw new Error('User is not a member of a group');
		if (ctx.auth.user.membership.role !== 'admin') throw new Error('User is not an admin');

		const group = await ctx.db
			.query('groups')
			.withIndex('by_group', (q) => q.eq('workosGroupId', ctx.auth.user.membership!.workosGroupId))
			.first();
		if (!group) throw new Error('Group not found');

		await ctx.db.patch(group._id, {
			key: args.apiKey
		});
	}
});

export const internalCreateGroup = internalMutation({
	args: {
		workosGroupId: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		canViewMembersChats: v.boolean(),
		allowPublicChats: v.boolean(),
		apiKeyEncrypted: v.string()
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('groups', {
			workosGroupId: args.workosGroupId,
			name: args.name,
			description: args.description ?? '',
			encryptionMode: 'RSA',
			key: args.apiKeyEncrypted,
			options: {
				canViewMembersChats: args.canViewMembersChats,
				allowPublicChats: args.allowPublicChats
			}
		});
	}
});

export const internalUpdateUserMembership = internalMutation({
	args: {
		userId: v.string(),
		membershipId: v.string(),
		organizationId: v.union(v.string(), v.null()),
		role: v.union(v.string(), v.null())
	},
	handler: async (ctx, args) => {
		await updateUserMembership(ctx, args);
	}
});
