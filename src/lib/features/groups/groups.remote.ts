import { command, getRequestEvent } from '$app/server';
import { api } from '$lib/convex/_generated/api';
import { key } from '$lib/utils/encryption';
import { z } from 'zod';

export const createGroup = command(
	z.object({
		name: z.string(),
		description: z.string().optional(),
		canViewMembersChats: z.boolean(),
		allowPublicChats: z.boolean(),
		apiKey: z.string()
	}),
	async (args) => {
		const { locals } = getRequestEvent();

		args.apiKey = key.encrypt(args.apiKey, 'base64');

		await locals.convex.action(api.groups.createGroup, {
			name: args.name,
			description: args.description,
			canViewMembersChats: args.canViewMembersChats,
			allowPublicChats: args.allowPublicChats,
			apiKeyEncrypted: args.apiKey
		});
	}
);

export const updateGroupApiKey = command(
	z.object({
		apiKey: z.string()
	}),
	async (args) => {
		const { locals } = getRequestEvent();

		args.apiKey = key.encrypt(args.apiKey, 'base64');

		await locals.convex.mutation(api.groups.updateGroupApiKey, { apiKey: args.apiKey });
	}
);
