import { v } from 'convex/values';
import { httpAction, internalQuery, query } from './_generated/server';
import { mutation, internalMutation } from './functions';
import { components, internal } from './_generated/api';
import {
	PersistentTextStreaming,
	StreamId,
	StreamIdValidator
} from '@convex-dev/persistent-text-streaming';
import { Id } from './_generated/dataModel';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { ModelMessage, streamText } from 'ai';
import { getChatMessages, getLastUserAndAssistantMessages } from './chat.utils';

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming);

export const Prompt = v.object({
	modelId: v.string(),
	input: v.string()
});

export const create = mutation({
	args: {
		chatId: v.optional(v.id('chat')),
		prompt: Prompt
	},
	handler: async (ctx, args): Promise<{ chatId: Id<'chat'>; messageId: Id<'messages'> }> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		let chatId: Id<'chat'>;
		if (!args.chatId) {
			chatId = await ctx.db.insert('chat', {
				userId: user.subject,
				title: 'Untitled Chat',
				generating: true,
				updatedAt: Date.now(),
				pinned: false
			});
		} else {
			chatId = args.chatId;
		}

		const messageId = await ctx.db.insert('messages', {
			chatId,
			role: 'user',
			content: args.prompt.input,
			chatSettings: {
				modelId: args.prompt.modelId
			}
		});

		const streamId = await persistentTextStreaming.createStream(ctx);
		await ctx.db.insert('messages', {
			chatId,
			role: 'assistant',
			streamId,
			meta: {
				modelId: args.prompt.modelId,
				startedGenerating: Date.now()
			}
		});

		return {
			chatId,
			messageId
		};
	}
});

export const getChatBody = query({
	args: {
		streamId: StreamIdValidator
	},
	handler: async (ctx, args) => {
		return await persistentTextStreaming.getStreamBody(ctx, args.streamId as StreamId);
	}
});

export const streamMessage = httpAction(async (ctx, request) => {
	const { streamId, chatId, apiKey } = (await request.json()) as {
		streamId: StreamId;
		chatId: Id<'chat'>;
		apiKey: string | undefined;
	};

	const messages = await ctx.runQuery(internal.messages.getMessagesForChat, { chatId });

	const last = getLastUserAndAssistantMessages(messages);
	if (!last) {
		return new Response('There was a problem getting the previous messages', { status: 400 });
	}

	// remove the assistant message so it's not part of the generation
	messages.pop();

	const response = await persistentTextStreaming.stream(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		ctx as any,
		request,
		streamId,
		async (ctx, _request, _streamId, append) => {
			try {
				const openrouter = createOpenRouter({
					apiKey
				});

				const { fullStream } = streamText({
					model: openrouter.chat(last.userMessage.chatSettings.modelId),
					messages: messages.map(
						(message) =>
							({
								role: message.role,
								content: message.content ?? ''
							}) satisfies ModelMessage
					)
				});

				let content = '';

				for await (const chunk of fullStream) {
					if (chunk.type === 'text-delta') {
						content += chunk.text;
						await append(chunk.text);
					}
				}

				await ctx.runMutation(internal.messages.updateMessageContent, {
					messageId: last.assistantMessage._id,
					content
				});
			} catch (error) {
				await ctx.runMutation(internal.messages.updateMessageError, {
					messageId: last.assistantMessage._id,
					error:
						error instanceof Error ? error.message : 'There was an error generating the response'
				});
			}
		}
	);

	response.headers.set('Access-Control-Allow-Origin', '*');
	response.headers.set('Vary', 'Origin');

	return response;
});

export const getMessagesForChat = internalQuery({
	args: {
		chatId: v.id('chat')
	},
	handler: async (ctx, args) => {
		const chat = await ctx.db.get(args.chatId);
		const user = await ctx.auth.getUserIdentity();

		if (!chat || !user || chat.userId !== user.subject)
			throw new Error('Chat not found or you are not authorized to access it');

		return await getChatMessages(ctx, args.chatId);
	}
});

export const updateMessageContent = internalMutation({
	args: {
		messageId: v.id('messages'),
		content: v.string()
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		if (!message) throw new Error('Message not found');
		if (message.role !== 'assistant') throw new Error('Message is not an assistant message');
		await ctx.db.patch(args.messageId, {
			content: args.content,
			meta: {
				...message.meta,
				stoppedGenerating: Date.now()
			}
		});
	}
});

export const updateMessageError = internalMutation({
	args: {
		messageId: v.id('messages'),
		error: v.string()
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		if (!message) throw new Error('Message not found');
		if (message.role !== 'assistant') throw new Error('Message is not an assistant message');
		await ctx.db.patch(args.messageId, {
			error: args.error,
			meta: {
				...message.meta,
				stoppedGenerating: Date.now()
			}
		});
	}
});
