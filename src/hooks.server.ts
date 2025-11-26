import { configureAuthKit, authKitHandle } from '@workos/authkit-sveltekit';
import { env } from '$lib/env.server';

configureAuthKit({
	clientId: env.PUBLIC_WORKOS_CLIENT_ID,
	apiKey: env.WORKOS_API_KEY,
	redirectUri: env.PUBLIC_WORKOS_REDIRECT_URI,
	cookiePassword: env.WORKOS_COOKIE_PASSWORD
});

export const handle = authKitHandle();
