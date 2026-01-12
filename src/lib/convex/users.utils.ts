import type { UserIdentity } from 'convex/server';
import type { QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';

export type User = Doc<'users'> & {
	membership: Doc<'groupMembers'> | null;
};

export async function getUser(ctx: QueryCtx, identity: UserIdentity): Promise<User | null> {
	const [user, membership] = await Promise.all([
		ctx.db
			.query('users')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', identity.subject))
			.first(),
		ctx.db
			.query('groupMembers')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', identity.subject))
			.first()
	]);
	if (!user) return null;
	return {
		...user,
		membership
	};
}
