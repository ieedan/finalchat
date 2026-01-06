import { api } from '$lib/convex/_generated/api';
import { getApiKey } from '$lib/features/api-keys/api-keys.remote.js';
import { getModels } from '$lib/features/models/models.remote.js';
import { authKit } from '@workos/authkit-sveltekit';

export async function load(event) {
	const [user, userSettings, chats, apiKey, models] = await Promise.all([
		authKit.getUser(event),
		event.locals.convex.query(api.userSettings.get, {}),
		event.locals.convex.query(api.chats.getAll, {}),
		getApiKey(),
		getModels()
	]);
	return {
		user,
		userSettings,
		chats,
		apiKey,
		models
	};
}
