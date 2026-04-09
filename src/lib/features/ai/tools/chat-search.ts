import { tool } from 'ai';
import { z } from 'zod';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { ContextType } from './types.js';

export const chatSearchTool = tool({
	description: 'Search previous chats with the user',
	inputSchema: z.object({
		query: z.string(),
		excludeChatIds: z.optional(z.array(z.string()))
	}),
	execute: async ({ query, excludeChatIds }, { experimental_context }) => {
		const context = experimental_context as ContextType;

		const results = await context.ctx.runQuery(api.chats.search, {
			query,
			excludeChatIds: [context.chatId, ...(excludeChatIds ?? [])] as Id<'chats'>[]
		});

		return results;
	}
});
