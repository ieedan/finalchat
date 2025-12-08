import { DataModel, Doc, Id } from './_generated/dataModel';
import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import type { ChatMessageAssistant, ChatMessageUser } from './schema';
import { asyncMap } from 'convex-helpers';
import { api, internal } from './_generated/api';

export type MessageWithAttachments = Doc<'messages'> & {
	attachments?: (Doc<'chatAttachments'> & { url: string })[];
};

export async function getChatMessages(
	ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
	chatId: Id<'chat'>
): Promise<MessageWithAttachments[]> {
	const messages = await ctx.db
		.query('messages')
		.withIndex('by_chat', (q) => q.eq('chatId', chatId))
		.collect();

	const messagesWithAttachments = asyncMap(messages, async (message) => {
		if (message.role === 'assistant') return message;

		const attachments = await ctx.db
			.query('chatAttachments')
			.withIndex('by_message', (q) => q.eq('messageId', message._id))
			.collect();

		const attachmentsWithUrl = await asyncMap(attachments, async (attachment) => {
			const url = await ctx.runQuery(api.chatAttachments.getFileUrl, {
				key: attachment.key
			});
			return {
				...attachment,
				url
			};
		});

		return {
			...message,
			attachments: attachmentsWithUrl
		};
	});

	return messagesWithAttachments;
}

export async function getChatMessagesInternal(
	ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
	chatId: Id<'chat'>
): Promise<MessageWithAttachments[]> {
	const messages = await ctx.db
		.query('messages')
		.withIndex('by_chat', (q) => q.eq('chatId', chatId))
		.collect();

	const messagesWithAttachments = asyncMap(messages, async (message) => {
		if (message.role === 'assistant') return message;

		const attachments = await ctx.db
			.query('chatAttachments')
			.withIndex('by_message', (q) => q.eq('messageId', message._id))
			.collect();

		const attachmentsWithUrl = await asyncMap(attachments, async (attachment) => {
			const url = await ctx.runQuery(internal.chatAttachments.internalGetFileUrl, {
				key: attachment.key
			});
			return {
				...attachment,
				url
			};
		});

		return {
			...message,
			attachments: attachmentsWithUrl
		};
	});

	return messagesWithAttachments;
}

export function getLastUserAndAssistantMessages(messages: Doc<'messages'>[]): {
	userMessage: ChatMessageUser & { _id: Id<'messages'>; _creationTime: number };
	assistantMessage: ChatMessageAssistant & { _id: Id<'messages'>; _creationTime: number };
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
