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
		workosGroupId: v.optional(v.string()),
		workosUserId: v.string(),
		messageId: v.id('messages'),
		key: v.string(),
		mediaType: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('chatAttachments', {
			chatId: args.chatId,
			messageId: args.messageId,
			key: args.key,
			workosUserId: args.workosUserId,
			workosGroupId: args.workosGroupId,
			mediaType: args.mediaType
		});
	}
});

export const internalGetAttachment = internalQuery({
	args: {
		key: v.string()
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('chatAttachments')
			.withIndex('by_key', (q) => q.eq('key', args.key))
			.first();
	}
});

export const getAll = query({
	args: {},
	handler: async (ctx) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return [];

		const attachments = await ctx.db
			.query('chatAttachments')
			.withIndex('by_workos_user', (q) => q.eq('workosUserId', user.subject))
			.collect();

		const attachmentsWithUrls = await Promise.all(
			attachments.map(async (attachment) => {
				const url = await r2.getUrl(attachment.key, { expiresIn: undefined });
				return { ...attachment, url };
			})
		);

		return attachmentsWithUrls;
	}
});

export const remove = mutation({
	args: {
		ids: v.array(v.id('chatAttachments'))
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		for (const id of args.ids) {
			const attachment = await ctx.db.get(id);
			if (!attachment || attachment.workosUserId !== user.subject) {
				throw new Error('Attachment not found or you are not authorized to delete it');
			}

			// Delete from R2
			await r2.deleteObject(ctx, attachment.key);
			// Delete from database
			await ctx.db.delete(id);
		}
	}
});

export const downloadFile = httpAction(async (ctx, request) => {
	const { key } = await request.json();

	const attachment = await ctx.runQuery(internal.chatAttachments.internalGetAttachment, { key });
	if (!attachment) {
		return new Response('Attachment not found', { status: 404 });
	}

	const chat = await ctx.runQuery(internal.chats.internalGetChat, { chatId: attachment.chatId });
	if (!chat) {
		return new Response('Chat not found', { status: 404 });
	}

	// Check if the chat is public or if the user has access
	const user = await ctx.auth.getUserIdentity();
	const isPublic = chat.public === true;
	const isOwner = user && chat.workosUserId === user.subject;

	if (!isPublic && !isOwner) {
		return new Response('Unauthorized', { status: 403 });
	}

	const fileUrl = await ctx.runQuery(internal.chatAttachments.internalGetFileUrl, { key });

	const response = await fetch(fileUrl);

	const newResponse = new Response(response.body, response);

	newResponse.headers.set('Access-Control-Allow-Origin', '*');

	return newResponse;
});
