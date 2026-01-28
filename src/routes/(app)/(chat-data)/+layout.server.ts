import { api } from '$lib/convex/_generated/api';
import { getApiKey } from '$lib/features/api-keys/api-keys.remote.js';
import { getModels } from '$lib/features/models/models.remote.js';

export async function load(event) {
	// we need to call this to update the access token in the convex client
	await event.locals.auth();
	const [userSettings, chats, apiKey, models] = await Promise.all([
		event.locals.convex.query(api.userSettings.get, {}),
		event.locals.convex.query(api.chats.getAll, {}),
		getApiKey(),
		getModels()
	]);
	return {
		userSettings,
		chats,
		apiKey,
		models
	};
}
