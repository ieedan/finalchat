import {
	mutation as rawMutation,
	internalMutation as rawInternalMutation
} from './_generated/server';
import { DataModel } from './_generated/dataModel';
import { Triggers } from 'convex-helpers/server/triggers';
import { customCtx, customMutation } from 'convex-helpers/server/customFunctions';

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
	}
});

triggers.register('messages', async (ctx, change) => {  
    // any changes to messages belonging to a chat will update the chat's updatedAt timestamp
    if (change.operation === 'insert' || change.operation === 'update') {
        const chatId = change.newDoc.chatId;
        await ctx.db.patch(chatId, {
            updatedAt: Date.now()
        });
    }
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));
