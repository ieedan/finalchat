import { env } from '$lib/env.server';
import type { Handle } from '@sveltejs/kit';
import { ConvexClient } from 'convex/browser';
import { sequence } from '@sveltejs/kit/hooks';
import { authKit } from '$lib/workos.server';

const injectConvex: Handle = async ({ event, resolve }) => {
	const convex = new ConvexClient(env.PUBLIC_CONVEX_URL);

	event.locals.convex = convex;

	return resolve(event);
};

export const handle = sequence(authKit.handle(), injectConvex);
