import z from 'zod';
import type { Model, ModelId } from './features/chat/types';
import { tool } from 'ai';

export const TITLE_GENERATION_MODEL = 'google/gemini-2.5-flash' as ModelId;

export const DEFAULT_ENABLED_MODEL_IDS = [
	'google/gemini-3-pro-preview',
	'anthropic/claude-opus-4.5',
	'openai/gpt-5.1',
	'openai/gpt-oss-120b',
	'google/gemini-2.5-flash',
	'google/gemini-2.5-flash-lite'
] as ModelId[];

export const BASIC_MODELS: Model[] = [
	{
		id: 'google/gemini-2.5-flash' as ModelId,
		name: 'Balanced',
		description: 'Fast and reliable.'
	},
	{
		id: 'google/gemini-2.5-flash-lite' as ModelId,
		name: 'Fast',
		description: 'Fast and cheap model.'
	},
	{
		id: 'openai/gpt-5.1' as ModelId,
		name: 'Thoughtful',
		description: 'Smart and detailed.'
	}
];

export const fetchLinkContentTool = tool({
	name: 'fetch-link-content',
	description: 'Fetch the text content of a link',
	inputSchema: z.object({
		link: z.string()
	}),
	execute: async ({ link }, { abortSignal }) => {
		try {
			const response = await fetch(link, {
				method: 'GET',
				signal: abortSignal
			});
			if (!response.ok) {
				throw new Error(`${response.status} ${response.statusText}`);
			}
			const contentType = response.headers.get('content-type');
			const allowedTypes = ['text/plain', 'text/markdown'];
			if (allowedTypes.some((type) => contentType?.includes(type))) {
				return await response.text();
			}
			throw new Error(
				'Link response was not markdown. Maybe you need to add .md or .mdx to the end of the link?'
			);
		} catch (error) {
			return `Error reading link content: ${error instanceof Error ? error.message : error}`;
		}
	}
});
