import { api } from '$lib/convex/_generated/api';
import type { Id } from '$lib/convex/_generated/dataModel';

export async function load({ params, locals }) {
	const chat = await locals.convex.query(api.chat.get, { chatId: params.chatId as Id<'chat'> });

	return {
		chat
	};
}
