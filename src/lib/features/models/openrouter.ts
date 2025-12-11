import type { ModelId } from '../chat/types';

export type ModelsResponse = {
	data: Model[];
};

export type Model = {
	id: ModelId;
	canonical_slug: string;
	name: string;
	created: number;
	pricing: Pricing;
	context_length: number;
	architecture: Architecture;
	top_provider: TopProvider;
	per_request_limits: PerRequestLimits;
	supported_parameters: string[];
	default_parameters: DefaultParameters;
	description: string;
};

export type Architecture = {
	modality: string;
	input_modalities: string[];
	output_modalities: string[];
	tokenizer: string;
	instruct_type: string;
};

export type DefaultParameters = {
	temperature: number;
	top_p: number;
	frequency_penalty: number;
};

export type PerRequestLimits = {
	prompt_tokens: number;
	completion_tokens: number;
};

export type Pricing = {
	prompt: string;
	completion: string;
	request: string;
	image: string;
};

export type TopProvider = {
	is_moderated: boolean;
	context_length: number;
	max_completion_tokens: number;
};

export interface ApiKey {
	hash: string;
	name: string;
	label: string;
	disabled: boolean;
	limit: number;
	limit_remaining: number;
	limit_reset: string;
	include_byok_in_limit: boolean;
	usage: number;
	usage_daily: number;
	usage_weekly: number;
	usage_monthly: number;
	byok_usage: number;
	byok_usage_daily: number;
	byok_usage_weekly: number;
	byok_usage_monthly: number;
	created_at: Date;
	updated_at: Date;
	expires_at: Date;
}

export function parseModelName(name: string): { lab: string | null; name: string } {
	if (name.includes(':')) {
		const [lab, model] = name.split(':');

		return { lab, name: model.trim() };
	}

	return { lab: null, name: name.trim() };
}

export function supportsImages(model: Model): boolean {
	return model.architecture.input_modalities.includes('image');
}

export function supportsReasoning(model: Model): boolean {
	return model.supported_parameters.includes('reasoning');
}

/**
 * Converts a cost string (USD per token) to cost per million tokens
 * @param costPerToken - The cost per token as a string (e.g., "0.0000007")
 * @returns The cost per million tokens as a number (e.g., 0.7)
 */
export function costPerMillionTokens(costPerToken: string): string {
	const cost = parseFloat(costPerToken);
	if (isNaN(cost) || cost === 0) {
		return '0';
	}
	return (cost * 1_000_000).toFixed(2);
}
