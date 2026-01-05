import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { api } from '$lib/convex/_generated/api';
import type { Id } from '$lib/convex/_generated/dataModel';
import OgImage from './og-image.svelte';

const ibmPlexSansRegular = new GoogleFont('IBM Plex Sans', {
	weight: 400,
	name: 'IBM Plex Sans'
});

export const GET: RequestHandler = async ({ params, locals }) => {
	const resolvedFontsPromise = resolveFonts([ibmPlexSansRegular]);

	const chatId = params.chatId as Id<'chats'>;

	try {
		const chat = await locals.convex.query(api.chats.getPublic, {
			chatId
		});

		if (!chat) {
			error(404, 'Chat not found');
		}

		// Get first two messages (user and assistant)
		const firstUserMessage = chat.messages.find((m) => m.role === 'user');
		const firstAssistantMessage = chat.messages.find((m) => m.role === 'assistant');

		return new ImageResponse(
			OgImage,
			{
				width: 1200,
				height: 630,
				fonts: await resolvedFontsPromise
			},
			{
				userMessage: firstUserMessage,
				assistantMessage: firstAssistantMessage,
			}
		);
	} catch {
		error(404, 'Chat not found');
	}
};
