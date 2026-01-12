import { v } from 'convex/values';
import { action, query } from './_generated/server';
import { internalMutation } from './functions';
import { authKit } from './auth';
import { updateUserMembership } from './auth.utils';
import { api, internal } from './_generated/api';
import { asyncMap } from 'convex-helpers';

export const getGroup = query({
	args: {
		groupId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		if (!args.groupId) return null;
		const user = await ctx.auth.getUserIdentity();
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
				(member) =>
					ctx.db
						.query('users')
						.withIndex('by_workos_user', (q) => q.eq('workosUserId', member.workosUserId))
						.first()
			)
		]);

		return {
			...group,
			members: groupMembers.filter((member) => member !== null)
		};
	}
});

export const createGroup = action({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		canViewMembersChats: v.boolean(),
		allowPublicChats: v.boolean()
	},
	handler: async (ctx, args) => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) throw new Error('Unauthorized');

		const user = await ctx.runQuery(api.users.get, {});
		if (!user) throw new Error('User not found');

		if (user.membership) throw new Error('User already belongs to a group');

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
			userId: user.workosUserId,
			roleSlug: 'admin'
		});

		// sync with convex ASAP if webhooks are different they can simply overwrite
		await Promise.all([
			ctx.runMutation(internal.groups.internalCreateGroup, {
				workosGroupId: workosGroup.id,
				name: workosGroup.name,
				description: args.description ?? '',
				canViewMembersChats: args.canViewMembersChats,
				allowPublicChats: args.allowPublicChats
			}),
			ctx.runMutation(internal.groups.internalUpdateUserMembership, {
				userId: user.workosUserId,
				organizationId: workosGroup.id,
				membershipId: membership.id,
				role: 'admin'
			})
		]);
	}
});

export const leaveGroup = action({
	handler: async (ctx) => {
		const workosUser = await ctx.auth.getUserIdentity();
		if (!workosUser) throw new Error('Unauthorized');

		const user = await ctx.runQuery(api.users.get, {});
		if (!user) throw new Error('User settings not found');

		if (!user.membership) throw new Error('User is not a member of a group');

		// TODO: handle how to deal with the group if an admin user leaves

		await authKit.workos.userManagement.deleteOrganizationMembership(
			user.membership.workosMembershipId
		);

		const orgMembers = await authKit.workos.userManagement.listOrganizationMemberships({
			organizationId: user.membership.workosGroupId
		});

		let organizationDeletionPromise: Promise<void> | null = null;
		if (
			orgMembers.data.filter((member) => member.status === 'active' && member.role.slug === 'admin')
				.length === 0
		) {
			// if there are no more admin users, delete the group
			organizationDeletionPromise = authKit.workos.organizations.deleteOrganization(
				user.membership.workosGroupId
			);
		}

		await ctx.runMutation(internal.groups.internalUpdateUserMembership, {
			userId: user.workosUserId,
			membershipId: user.membership.workosMembershipId,
			organizationId: null,
			role: null
		});

		if (organizationDeletionPromise) await organizationDeletionPromise;
	}
});

export const internalCreateGroup = internalMutation({
	args: {
		workosGroupId: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		canViewMembersChats: v.boolean(),
		allowPublicChats: v.boolean()
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('groups', {
			workosGroupId: args.workosGroupId,
			name: args.name,
			description: args.description ?? '',
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
