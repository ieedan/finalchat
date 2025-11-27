import { json } from '@sveltejs/kit';
import { authKit } from '@workos/authkit-sveltekit';

export const GET = authKit.withAuth(async ({ auth }) => {
	return json({
		accessToken: auth.accessToken
	});
});
