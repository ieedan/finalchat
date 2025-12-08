import type { Model, ModelId } from './features/chat/types';

export const TITLE_GENERATION_MODEL = 'google/gemini-2.5-flash' as ModelId;

export const BASIC_MODELS: Model[] = [
	{
		id: 'google/gemini-2.5-flash' as ModelId,
		name: 'Versatile',
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

export const ADVANCED_MODELS: Model[] = [
	{
		id: 'x-ai/grok-code-fast-1' as ModelId,
		name: 'Grok Code Fast 1'
	},
	{
		id: 'anthropic/claude-sonnet-4.5' as ModelId,
		name: 'Claude Sonnet 4.5'
	},
	{
		id: 'google/gemini-2.5-flash' as ModelId,
		name: 'Gemini 2.5 Flash'
	},
	{
		id: 'anthropic/claude-opus-4.5' as ModelId,
		name: 'Claude Opus 4.5'
	},
	{
		id: 'google/gemini-3-pro-preview' as ModelId,
		name: 'Gemini 3 Pro Preview'
	},
	{
		id: 'google/gemini-2.0-flash-001' as ModelId,
		name: 'Gemini 2.0 Flash'
	},
	{
		id: 'google/gemini-2.5-pro' as ModelId,
		name: 'Gemini 2.5 Pro'
	},
	{
		id: 'x-ai/grok-4-fast' as ModelId,
		name: 'Grok 4 Fast'
	},
	{
		id: 'openai/gpt-oss-120b' as ModelId,
		name: 'GPT-OSS-120b'
	},
	{
		id: 'google/gemini-2.5-flash-lite' as ModelId,
		name: 'Gemini 2.5 Flash Lite'
	}
];