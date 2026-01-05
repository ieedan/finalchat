import { api } from '$lib/convex/_generated/api';
import type { Id } from '$lib/convex/_generated/dataModel';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const chat = await locals.convex.query(api.chats.getPublic, {
		chatId: params.chatId as Id<'chats'>
	});

	if (!chat) error(404, 'Chat not found');

	return {
		chat
	};
}
