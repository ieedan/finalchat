import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';
import { env } from '../../../env.convex';

const exa = new Exa(env.EXA_API_KEY);

export const webSearch = tool({
	description: 'Search the web for information.',
	inputSchema: z.object({
		query: z.string(),
		excludeDomains: z.optional(z.array(z.string()))
	}),
	execute: async ({ query, excludeDomains }) => {
		const result = await exa.search(query, {
			type: 'instant',
			excludeDomains: excludeDomains ?? [],
			numResults: 4
		});

		return {
			// return todaysDate so that the AI knows what today is
			todaysDate: new Date().toISOString(),
			results: result.results
		};
	}
});
