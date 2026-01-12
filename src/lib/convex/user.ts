import { query } from "./_generated/server";

export const getGroupInvites = query({
	args: {},
	handler: async (ctx) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return null;

		const invitations = await ctx.db
			.query('invitations')
			.withIndex('by_invited', (q) => q.eq('invitedEmail', user.email ?? ''))
			.collect();

		return invitations.filter((invitation) => invitation.status === 'pending');
	}
});
