import type { Model, ModelId } from './features/chat/types';

export const TITLE_GENERATION_MODEL = 'google/gemini-2.5-flash-lite' as ModelId;

export const DEFAULT_ENABLED_MODEL_IDS = [
	'google/gemini-3-pro-preview',
	'anthropic/claude-opus-4.7',
	'openai/gpt-5.4-mini',
	'openai/gpt-oss-120b',
	'google/gemini-3-flash-preview',
	'google/gemini-3.1-flash-lite-preview',
	'moonshotai/kimi-k2.5',
	'google/gemini-3-pro-image-preview',
	'openai/gpt-5.4-image-2'
] as ModelId[];

export const BASIC_MODELS: Model[] = [
	{
		id: 'google/gemini-3-flash-preview' as ModelId,
		name: 'Balanced',
		description: 'Fast and reliable.'
	},
	{
		id: 'google/gemini-2.5-flash-lite' as ModelId,
		name: 'Fast',
		description: 'Fast and cheap model.'
	},
	{
		id: 'openai/gpt-5.4-mini' as ModelId,
		name: 'Thoughtful',
		description: 'Smart and detailed.'
	},
	{
		id: 'google/gemini-3-pro-image-preview' as ModelId,
		name: 'Image',
		description: 'Image generation model.'
	}
];
