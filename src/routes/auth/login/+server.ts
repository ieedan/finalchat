import { redirect } from '@sveltejs/kit';
import { authKit } from '@workos/authkit-sveltekit';

export async function GET() {
	const url = await authKit.getSignInUrl();

	redirect(303, url);
}
