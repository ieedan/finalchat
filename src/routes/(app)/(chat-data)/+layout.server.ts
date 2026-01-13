import { api } from '$lib/convex/_generated/api';
import { getApiKey } from '$lib/features/api-keys/api-keys.remote.js';
import { getModels } from '$lib/features/models/models.remote.js';

export async function load(event) {
	const [user, chats, apiKey, models] = await Promise.all([
		event.locals.convex.mutation(api.users.getOrSetup, {}),
		event.locals.convex.query(api.chats.getAll, {}),
		getApiKey(),
		getModels()
	]);
	return {
		user,
		chats,
		apiKey,
		models
	};
}
