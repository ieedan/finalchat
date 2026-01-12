import type { QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import type { authKit } from './auth';

export type User = Doc<'users'> & {
	membership: Doc<'groupMembers'> | null;
};

export async function getUser(
	ctx: QueryCtx,
	workosUser: NonNullable<Awaited<ReturnType<typeof authKit.getAuthUser>>>
): Promise<User | null> {
	const [user, membership] = await Promise.all([
		ctx.db
			.query('users')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', workosUser.id))
			.first(),
		ctx.db
			.query('groupMembers')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', workosUser.id))
			.first()
	]);
	if (!user) return null;
	return {
		...user,
		membership
	};
}
