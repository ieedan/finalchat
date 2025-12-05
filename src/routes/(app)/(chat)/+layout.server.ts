import { api } from '$lib/convex/_generated/api';
import { getApiKey } from '$lib/features/api-keys/api-keys.remote.js';
import { authKit } from '@workos/authkit-sveltekit';

export const load = authKit.withAuth(async ({ auth, locals }) => {
	const [userSettings, apiKey] = await Promise.all([
		locals.convex.query(api.userSettings.get, {}),
		getApiKey()
	]);
	return {
		user: auth.user!,
		userSettings,
		apiKey
	};
});
