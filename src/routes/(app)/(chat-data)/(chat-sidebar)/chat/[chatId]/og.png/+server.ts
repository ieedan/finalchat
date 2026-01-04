import { ImageResponse } from '@ethercorps/sveltekit-og';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { api } from '$lib/convex/_generated/api';
import type { Id } from '$lib/convex/_generated/dataModel';
import OgImage from './og-image.svelte';

export const GET: RequestHandler = async ({ params, locals }) => {
	const chatId = params.chatId as Id<'chat'>;

	try {
		const chat = await locals.convex.query(api.chat.getPublic, {
			chatId
		});

		if (!chat) {
			error(404, 'Chat not found');
		}

		// Get first two messages (user and assistant)
		const firstUserMessage = chat.messages.find((m) => m.role === 'user');
		const firstAssistantMessage = chat.messages.find((m) => m.role === 'assistant');

		return await new ImageResponse(OgImage, {
			props: {
				userMessage: firstUserMessage,
				assistantMessage: firstAssistantMessage,
				title: chat.title
			},
			width: 1200,
			height: 630
		});
	} catch (e) {
		error(404, 'Chat not found');
	}
};
