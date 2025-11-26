import { auth } from '$lib/workos.server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = () => auth(event);

	return resolve(event);
};
