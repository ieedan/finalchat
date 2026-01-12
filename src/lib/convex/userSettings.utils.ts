import type { UserIdentity } from 'convex/server';
import type { QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';

export type UserSettings = Doc<'userSettings'> & {
	membership: Doc<'groupMembers'> | null;
};

export async function getUserSettings(ctx: QueryCtx, identity: UserIdentity): Promise<UserSettings | null> {
	const [userSettings, membership] = await Promise.all([
		ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', identity.subject))
			.first(),
		ctx.db
			.query('groupMembers')
			.withIndex('by_user', (q) => q.eq('userId', identity.subject))
			.first()
	]);
	if (!userSettings) return null;
	return {
		...userSettings,
		membership
	};
}
