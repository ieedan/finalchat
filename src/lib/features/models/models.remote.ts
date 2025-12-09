import { query } from '$app/server';
import { env } from '$lib/env.server';
import type * as OpenRouter from './openrouter';
import { parseModelName } from './openrouter';

export const getModels = query(async () => {
	try {
		const response = await fetch(`https://openrouter.ai/api/v1/models`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${env.OPENROUTER_API_KEY}`
			}
		});

		const data = (await response.json()) as OpenRouter.ModelsResponse;

		return data.data
			.map((model) => {
				const { lab, name } = parseModelName(model.name);
				return {
					...model,
					name,
					lab
				};
			});
	} catch {
		return [];
	}
});
