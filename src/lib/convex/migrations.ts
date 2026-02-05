import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { repackStream } from '../utils/stream-transport-protocol';

export const migrations = new Migrations<DataModel>(components.migrations);

export const assistantMessagesAddUserId = migrations.define({
	table: 'messages',
	migrateOne: async (ctx, message) => {
		if (message.userId) return;

		const chat = await ctx.db.get(message.chatId);
		if (!chat) return;

		await ctx.db.patch(message._id, {
			userId: chat.userId
		});
	}
});

export const repackStreams = migrations.define({
	table: 'messages',
	migrateOne: async (ctx, message) => {
		// Only process assistant messages with content
		if (message.role !== 'assistant' || !message.content) return;

		const result = repackStream(message.content);
		if (result.isErr()) {
			console.error(`Failed to repack stream for message ${message._id}:`, result.error);
			return;
		}

		await ctx.db.patch(message._id, {
			content: result.value
		});
	}
});

export const runAll = migrations.runner([
	internal.migrations.assistantMessagesAddUserId,
	internal.migrations.repackStreams
]);
