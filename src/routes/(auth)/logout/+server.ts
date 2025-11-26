import { env } from '$lib/env.server';
import { clearSessionCookie, getSessionCookie, workos } from '$lib/workos.server';
import { redirect } from '@sveltejs/kit';

export async function GET({ cookies }) {
	const session = workos.userManagement.loadSealedSession({
		sessionData: getSessionCookie(cookies)!,
		cookiePassword: env.WORKOS_COOKIE_PASSWORD
	});

	const url = await session.getLogoutUrl({
		returnTo: '/'
	});

	clearSessionCookie(cookies);

	redirect(302, url);
}
