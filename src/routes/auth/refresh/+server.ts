import { json } from '@sveltejs/kit';
import { authKit } from '@workos/authkit-sveltekit';

export const GET = authKit.withAuth(async ({ auth }) => {
    console.log('refreshing token')
	return json({
		accessToken: auth.accessToken
	});
});
