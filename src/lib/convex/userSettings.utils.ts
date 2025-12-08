import { UserIdentity } from 'convex/server';
import { QueryCtx } from './_generated/server';

export function getUserSettings(ctx: QueryCtx, identity: UserIdentity) {
	return ctx.db
		.query('userSettings')
		.withIndex('by_user', (q) => q.eq('userId', identity.subject))
		.first();
}
