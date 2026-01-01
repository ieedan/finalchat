import {
	mutation as rawMutation,
	internalMutation as rawInternalMutation
} from './_generated/server';
import type { DataModel } from './_generated/dataModel';
import { Triggers } from 'convex-helpers/server/triggers';
import { customCtx, customMutation } from 'convex-helpers/server/customFunctions';
import { r2 } from './chatAttachments';

const triggers = new Triggers<DataModel>();

triggers.register('chat', async (ctx, change) => {
	// delete all messages for the chat
	if (change.operation === 'delete') {
		const id = change.oldDoc._id;

		const messages = await ctx.db
			.query('messages')
			.withIndex('by_chat', (q) => q.eq('chatId', id))
			.collect();

		for (const message of messages) {
			await ctx.db.delete(message._id);
		}

		const attachments = await ctx.db
			.query('chatAttachments')
			.withIndex('by_chat', (q) => q.eq('chatId', id))
			.collect();

		for (const attachment of attachments) {
			await r2.deleteObject(ctx, attachment.key);
		}
	}
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));
