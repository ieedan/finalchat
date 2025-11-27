import { WorkOS } from '@workos-inc/node';
import { env } from './env.server';

export const workos = new WorkOS(env.WORKOS_API_KEY, {
	clientId: env.PUBLIC_WORKOS_CLIENT_ID
});
