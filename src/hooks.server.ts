import { authKitHandle, configureAuthKit } from '@workos/authkit-sveltekit';
import { env } from '$lib/env.server';
import type { Handle } from '@sveltejs/kit';
import { ConvexClient } from 'convex/browser';
import { sequence } from '@sveltejs/kit/hooks';
import { SERVER_CONVEX_URL } from '$lib/convex.config';

configureAuthKit({
	clientId: env.PUBLIC_WORKOS_CLIENT_ID,
	apiKey: env.WORKOS_API_KEY,
	redirectUri: new URL('/auth/callback', env.VERCEL_URL).toString(),
	cookiePassword: env.WORKOS_COOKIE_PASSWORD
});

const authHandle = authKitHandle();

const injectConvex: Handle = async ({ event, resolve }) => {
	const convex = new ConvexClient(SERVER_CONVEX_URL);

	if (event.locals.auth.accessToken) {
		// where it's needed we should already be keeping the token up to date with authKit
		convex.setAuth(async () => event.locals.auth.accessToken);
	}

	event.locals.convex = convex;

	return resolve(event);
};

export const handle = sequence(authHandle, injectConvex);
