import { v } from 'convex/values';
import { action, httpAction, internalQuery, mutation, query } from './_generated/server';
import { api, components, internal } from './_generated/api';
import {
	PersistentTextStreaming,
	StreamId,
	StreamIdValidator
} from '@convex-dev/persistent-text-streaming';
import { Doc, Id } from './_generated/dataModel';
import { openrouter } from '../ai';

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
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return;

		let chatId: Id<'chat'>;
		if (!args.chatId) {
			chatId = await ctx.db.insert('chat', {
				userId: user.subject,
				title: 'Untitled Chat',
				generating: true
			});
		} else {
			chatId = args.chatId;
		}

		const messageId = await ctx.db.insert('messages', {
			chatId,
			role: 'user',
			content: args.prompt.input,
			userId: user.subject
		});

		const streamId = await persistentTextStreaming.createStream(ctx);
		await ctx.db.insert('messages', {
			chatId,
			role: 'assistant',
			streamId,
			modelId: args.prompt.modelId,
			userId: user.subject
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

export const getMessageByStream = internalQuery({
	args: {
		streamId: StreamIdValidator
	},
	handler: async (ctx, args): Promise<Doc<'messages'> | null> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return null;

		return await ctx.db
			.query('messages')
			.withIndex('by_stream', (q) => q.eq('streamId', args.streamId as StreamId))
			.first();
	}
});

export const streamChat = httpAction(async (ctx, request) => {
	const user = await ctx.auth.getUserIdentity();
	const { streamId, messageId } = (await request.json()) as { streamId: string; messageId: string };

    const message = await ctx.runQuery(internal.messages.getMessageByStream, { streamId });
    if (!message) return new Response('Message not found', { status: 404 });
    if (message.role === 'user') return new Response('This is not an assistant message', { status: 400 });
    if (!message.modelId) return new Response('This is not an assistant message', { status: 400 });

    if (message.userId !== user?.subject) return new Response('Unauthorized', { status: 401 });

    const chat =  openrouter.chat(message.modelId);
    chat.doStream({
        prompt: message.cont
    })

    // const response = await persistentTextStreaming.stream(ctx, request, streamId);

    // return response;

    return new Response('OK', { status: 200 });
});
