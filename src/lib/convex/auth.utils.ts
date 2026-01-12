import type { GenericMutationCtx } from 'convex/server';
import type { DataModel } from './_generated/dataModel';

export async function updateUserMembership(
	ctx: GenericMutationCtx<DataModel>,
	{
		userId,
		organizationId,
		membershipId,
		role
	}: {
		userId: string;
		organizationId: string | null;
		membershipId: string | null;
		role: string | null;
	}
) {
	const membership = await ctx.db
		.query('groupMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.first();
	if (membership) {
		if (organizationId === null || role === null) {
			// remove membership if it exists
			await ctx.db.delete(membership._id);
		} else {
			// update membership if it exists
			await ctx.db.patch(membership._id, {
				workosGroupId: organizationId,
				role
			});
		}
	} else {
		// if it doesn't exist and we don't have an organization id or role, do nothing
		if (organizationId === null || role === null || membershipId === null) return;
		// create membership if it doesn't exist
		await ctx.db.insert('groupMembers', {
			workosGroupId: organizationId,
			workosMembershipId: membershipId,
			userId,
			role
		});
	}
}
