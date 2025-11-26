import { internalAction } from './_generated/server';
import { workos } from '../workos.convex';
import { authenticateWithSessionCookie } from '../workos';
import { v } from 'convex/values';
import { env } from '../env.convex';
import { User } from '@workos-inc/node';

export const auth = internalAction({
    args: { sessionCookie: v.string() },
    handler: async (_, args): Promise<User | null> => {
        return authenticateWithSessionCookie(workos, {
            sessionCookie: args.sessionCookie,
            cookiePassword: env.WORKOS_COOKIE_PASSWORD
        })
    }
})