import { tool } from 'ai';
import { z } from 'zod';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { ContextType } from './types.js';

export const getChat = tool({
	description: 'Get a chat by its ID',
	inputSchema: z.object({
		chatId: z.string()
	}),
	execute: async ({ chatId }, { experimental_context }) => {
		const context = experimental_context as ContextType;
		return await context.ctx.runQuery(api.chats.get, { chatId: chatId as Id<'chats'> });
	}
});
