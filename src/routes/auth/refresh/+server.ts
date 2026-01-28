import { json } from '@sveltejs/kit';
import { authKit } from '$lib/workos.server';

export const GET = authKit.withAuth(async ({ auth }) => {
	return json({
		accessToken: auth.accessToken
	});
});
