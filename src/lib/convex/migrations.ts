import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';

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

export const runAll = migrations.runner([internal.migrations.assistantMessagesAddUserId]);
