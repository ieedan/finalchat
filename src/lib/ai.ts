import type { Model, ModelId } from './features/chat/types';

export const TITLE_GENERATION_MODEL = 'google/gemini-2.5-flash' as ModelId;

export const DEFAULT_ENABLED_MODEL_IDS = [
	'google/gemini-3-pro-preview',
	'anthropic/claude-opus-4.5',
	'openai/gpt-5.1',
	'openai/gpt-oss-120b',
	'google/gemini-2.5-flash',
	'google/gemini-2.5-flash-lite',
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