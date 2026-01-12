import {
	mutation as rawMutation,
	internalMutation as rawInternalMutation,
	query,
	action
} from './_generated/server';
import type { DataModel } from './_generated/dataModel';
import { Triggers } from 'convex-helpers/server/triggers';
import {
	customAction,
	customCtx,
	customMutation,
	customQuery
} from 'convex-helpers/server/customFunctions';
import { r2 } from './r2';
import { authKit } from './auth';
import { getUser, type User } from './users.utils';
import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import { api } from './_generated/api';

const triggers = new Triggers<DataModel>();

triggers.register('chats', async (ctx, change) => {
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

async function authWrapper(ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>) {
	const workosUser = await authKit.getAuthUser(ctx);
	if (!workosUser) throw new Error('Unauthorized');

	const user = await getUser(ctx, workosUser);
	if (!user) throw new Error('User not found');

	return {
		ctx: { auth: { user } },
		args: {}
	};
}

export const authQuery = customQuery(query, {
	args: {},
	input: authWrapper
});

export const authMutation = customMutation(mutation, {
	args: {},
	input: authWrapper
});

export const authAction = customAction(action, {
	args: {},
	input: async (ctx): Promise<{ ctx: { auth: { user: User } }; args: object }> => {
		const workosUser = await authKit.getAuthUser(ctx);
		if (!workosUser) throw new Error('Unauthorized');

		const user = await ctx.runQuery(api.users.get, {});
		if (!user) throw new Error('User not found');

		return {
			ctx: { auth: { user } },
			args: {}
		};
	}
});
