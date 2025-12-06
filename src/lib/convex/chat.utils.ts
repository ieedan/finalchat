import { DataModel, Doc, Id } from './_generated/dataModel';
import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import type { ChatMessageAssistant, ChatMessageUser } from './schema';

export async function getChatMessages(
	ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
	chatId: Id<'chat'>
): Promise<Doc<'messages'>[]> {
	const messages = await ctx.db
		.query('messages')
		.withIndex('by_chat', (q) => q.eq('chatId', chatId))
		.collect();

	return messages;
}

export function getLastUserAndAssistantMessages(messages: Doc<'messages'>[]): {
	userMessage: ChatMessageUser & { _id: Id<'messages'>, _creationTime: number };
	assistantMessage: ChatMessageAssistant & { _id: Id<'messages'>, _creationTime: number };
} | null {
	if (messages.length < 2) return null;

	const assistantMessage = messages[messages.length - 1];
    if (!assistantMessage || assistantMessage.role !== 'assistant') {
        return null;
    }

	const userMessage = messages[messages.length - 2];
    if (!userMessage || userMessage.role !== 'user') {
        return null;
    }

	return {
		userMessage,
		assistantMessage
	};
}
