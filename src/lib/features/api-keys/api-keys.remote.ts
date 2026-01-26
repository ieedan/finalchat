import { command, getRequestEvent, query } from '$app/server';
import { api } from '$lib/convex/_generated/api';
import { key } from '$lib/utils/encryption';
import z from 'zod';

export const getApiKey = query(async () => {
	const { locals } = getRequestEvent();

	const apiKey = await locals.convex.query(api.apiKeys.get, {});
	if (!apiKey) return null;

	apiKey.key = key.decrypt(apiKey.key, 'utf8');

	return apiKey;
});

export const createApiKey = command(
	z.object({
		key: z.string()
	}),
	async (args) => {
		const { locals } = getRequestEvent();

		args.key = key.encrypt(args.key, 'base64');

		await locals.convex.mutation(api.apiKeys.createOrUpdate, { key: args.key });
	}
);
