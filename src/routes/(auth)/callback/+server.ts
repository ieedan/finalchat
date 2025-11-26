import { env } from '$lib/env.server.js';
import { setSessionCookie, workos } from '$lib/workos.server';
import { redirect } from '@sveltejs/kit';
import type { AuthenticationResponse } from '@workos-inc/node';

export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code');
	if (!code) {
		return new Response('No code provided', { status: 400 });
	}

	let authenticationResponse: AuthenticationResponse;
	try {
		authenticationResponse = await workos.userManagement.authenticateWithCode({
			code,
			clientId: env.WORKOS_CLIENT_ID,
			session: {
				sealSession: true,
				cookiePassword: env.WORKOS_COOKIE_PASSWORD
			}
		});
	} catch {
		redirect(302, '/login');
	}

	const { sealedSession } = authenticationResponse;

	setSessionCookie(cookies, sealedSession!);

	redirect(302, '/dashboard');
}
