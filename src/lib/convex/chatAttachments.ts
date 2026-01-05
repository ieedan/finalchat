import { v } from 'convex/values';
import { internalMutation, mutation } from './functions';
import { type R2Callbacks } from '@convex-dev/r2';
import { internal } from './_generated/api';
import { httpAction, internalQuery, query } from './_generated/server';
import { createKey, parseUploadKey, type UploadKey } from './chatAttachments.utils';
import { r2 } from './r2';

const callbacks: R2Callbacks = {
	onSyncMetadata: internal.chatAttachments.onSyncMetadata
};

export const { syncMetadata, onSyncMetadata, deleteObject, getMetadata, listMetadata } =
	r2.clientApi({
		checkUpload: async (ctx) => {
			const user = await ctx.auth.getUserIdentity();
			if (!user) throw new Error('Unauthorized');

			// also check subscription status here if relevant
		},
		callbacks,
		checkDelete: async (ctx, _, key) => {
			const user = await ctx.auth.getUserIdentity();
			if (!user) throw new Error('Unauthorized');

			const { userId } = parseUploadKey(key as UploadKey);
			if (userId !== user.subject) throw new Error('Unauthorized');
		},
		onDelete: async (ctx, _, key) => {
			await ctx.runMutation(internal.chatAttachments.syncRemoval, {
				key
			});
		}
	});

export const generateUploadUrl = mutation({
	handler: async (ctx): Promise<{ key: string; url: string }> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		return await r2.generateUploadUrl(createKey(user));
	}
});

export const getFileUrl = query({
	args: {
		key: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		const { userId } = parseUploadKey(args.key as UploadKey);
		if (userId !== user.subject) throw new Error('Unauthorized');

		return await r2.getUrl(args.key, {
			expiresIn: undefined // never expire, this just makes it easier
		});
	}
});

export const internalGetFileUrl = internalQuery({
	args: {
		key: v.string()
	},
	handler: async (_, args) => {
		return await r2.getUrl(args.key, {
			expiresIn: undefined // never expire, this just makes it easier
		});
	}
});

export const syncRemoval = internalMutation({
	args: {
		key: v.string()
	},
	handler: async (ctx, args) => {
		const file = await ctx.db
			.query('chatAttachments')
			.withIndex('by_key', (q) => q.eq('key', args.key))
			.first();
		// it's possible the file was deleted before it was attached to a chat
		if (!file) return;

		await ctx.db.delete(file._id);
	}
});

export const create = internalMutation({
	args: {
		chatId: v.id('chats'),
		messageId: v.id('messages'),
		key: v.string(),
		userId: v.string(),
		mediaType: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('chatAttachments', {
			chatId: args.chatId,
			messageId: args.messageId,
			key: args.key,
			userId: args.userId,
			mediaType: args.mediaType
		});
	}
});

export const downloadFile = httpAction(async (ctx, request) => {
	const user = await ctx.auth.getUserIdentity();
	if (!user) throw new Error('Unauthorized not');

	const { key } = await request.json();

	const { userId } = parseUploadKey(key as UploadKey);
	if (userId !== user.subject) throw new Error('Unauthorized');

	const response = await fetch(
		await ctx.runQuery(internal.chatAttachments.internalGetFileUrl, { key })
	);

	const newResponse = new Response(response.body, response);

	newResponse.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');

	return newResponse;
});
