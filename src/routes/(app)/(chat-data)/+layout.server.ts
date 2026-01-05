import { api } from '$lib/convex/_generated/api';
import { getApiKey } from '$lib/features/api-keys/api-keys.remote.js';
import { getModels } from '$lib/features/models/models.remote.js';
import { authKit } from '@workos/authkit-sveltekit';

export const load = authKit.withAuth(async ({ auth, locals }) => {
	const [userSettings, chats, apiKey, models] = await Promise.all([
		locals.convex.query(api.userSettings.get, {}),
		locals.convex.query(api.chats.getAll, {}),
		getApiKey(),
		getModels()
	]);
	return {
		user: auth.user!,
		userSettings,
		chats,
		apiKey,
		models
	};
});
