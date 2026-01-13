import { command, getRequestEvent, query } from '$app/server';
import { api } from '$lib/convex/_generated/api';
import NodeRSA from 'node-rsa';
import { env } from '$lib/env.server';
import z from 'zod';

const key = new NodeRSA(env.API_KEY_ENCRYPTION_KEY);

export const getApiKey = query(async () => {
	const { locals } = getRequestEvent();

	const apiKey = await locals.convex.query(api.apiKeys.get, {});
	if (!apiKey) return null;

	return key.decrypt(apiKey.key, 'utf8');
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

export const encryptApiKey = command(
	z.object({
		key: z.string()
	}),
	async (args) => {
		return key.encrypt(args.key, 'base64');
	}
);
