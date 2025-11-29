import { command, getRequestEvent, query } from '$app/server';
import { api } from '$lib/convex/_generated/api';
import NodeRSA from 'node-rsa';
import { env } from '$lib/env.server';
import z from 'zod';

const key = new NodeRSA(env.API_KEY_ENCRYPTION_KEY);

export const getApiKeys = query(async () => {
	const { locals } = getRequestEvent();

	const apiKeys = await locals.convex.query(api.apiKeys.getAll, {});

	for (const apiKey of apiKeys) {
		apiKey.key = key.decrypt(apiKey.key, 'utf8');
	}

	return apiKeys;
});

export const createApiKey = command(
	z.object({
		key: z.string()
	}),
	async (args) => {
		const { locals } = getRequestEvent();

        args.key = key.encrypt(args.key, 'utf8');

		await locals.convex.mutation(api.apiKeys.createOrUpdate, { key: args.key });
	}
);
