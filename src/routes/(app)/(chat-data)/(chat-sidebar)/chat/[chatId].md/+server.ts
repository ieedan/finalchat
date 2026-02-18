import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { api } from '$lib/convex/_generated/api';
import type { Id } from '$lib/convex/_generated/dataModel';
import {
	createMarkdownFilename,
	renderConversationMarkdown
} from '$lib/features/chat/chat-markdown';

export const GET: RequestHandler = async ({ params, locals }) => {
	// Ensure the Convex client picks up the user's access token for private chats.
	await locals.auth();

	const chatId = params.chatId as Id<'chats'>;
	const chat = await locals.convex.query(api.chats.get, { chatId }).catch(() => null);

	if (!chat) {
		error(404, 'Chat not found');
	}

	const markdown = renderConversationMarkdown(chat);
	const filename = createMarkdownFilename(chat.title, chatId);

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `inline; filename="${filename}"`,
			'Cache-Control': 'private, no-store'
		}
	});
};
