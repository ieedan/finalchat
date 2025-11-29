import { api } from '$lib/convex/_generated/api';
import { authKit } from '@workos/authkit-sveltekit';

export const load = authKit.withAuth(async ({ auth, locals }) => {
	const userSettings = await locals.convex.query(api.userSettings.get, {});
	return {
		user: auth.user!,
		userSettings
	};
});
