import { workos } from '$lib/workos.server';
import { env } from '$lib/env.server';
import { redirect } from '@sveltejs/kit';

export async function GET({ url }) {
	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		provider: 'authkit',
		redirectUri: new URL('/callback', url.origin).toString(),
		clientId: env.WORKOS_CLIENT_ID
	});

	redirect(302, authorizationUrl);
}
