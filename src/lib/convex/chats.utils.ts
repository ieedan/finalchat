import type { DataModel, Doc, Id } from './_generated/dataModel';
import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import type { ChatMessageAssistant, ChatMessageUser } from './schema';
import { asyncMap } from 'convex-helpers';
import { internal } from './_generated/api';
import { deserializeStream, type StreamResult } from '../utils/stream-transport-protocol';

export type MessageWithAttachments =
	| (ChatMessageUser & {
			attachments: (Doc<'chatAttachments'> & { url: string })[];
	  })
	| (ChatMessageAssistant & {
			parts: StreamResult;
			attachments: (Doc<'chatAttachments'> & { url: string })[];
	  });

export async function getChatMessages(
	ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
	chatId: Id<'chats'>
): Promise<MessageWithAttachments[]> {
	const messages = await ctx.db
		.query('messages')
		.withIndex('by_chat', (q) => q.eq('chatId', chatId))
		.collect();

	const messagesWithAttachments = asyncMap(messages, async (message) => {
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

		if (message.role === 'assistant') {
			const deserializedContentResult = deserializeStream({
				text: message.content ?? '',
				stack: []
			});
			if (deserializedContentResult.isErr()) {
				return {
					...message,
					attachments: attachmentsWithUrl,
					parts: []
				};
			}

			return {
				...message,
				attachments: attachmentsWithUrl,
				parts: deserializedContentResult.value.stack
			};
		}

		return {
			...message,
			attachments: attachmentsWithUrl
		};
	});

	return messagesWithAttachments;
}

export async function getChatMessagesInternal(
	ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
	chatId: Id<'chats'>
): Promise<MessageWithAttachments[]> {
	const messages = await ctx.db
		.query('messages')
		.withIndex('by_chat', (q) => q.eq('chatId', chatId))
		.collect();

	const messagesWithAttachments = asyncMap(messages, async (message) => {
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

		if (message.role === 'assistant') {
			const deserializedContentResult = deserializeStream({
				text: message.content ?? '',
				stack: []
			});
			if (deserializedContentResult.isErr()) {
				return {
					...message,
					attachments: attachmentsWithUrl,
					parts: []
				};
			}

			return {
				...message,
				parts: deserializedContentResult.value.stack,
				attachments: attachmentsWithUrl
			};
		}

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
