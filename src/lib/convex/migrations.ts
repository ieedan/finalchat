import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';

export const migrations = new Migrations<DataModel>(components.migrations);

/**
 * Backfill `width` / `height` on existing chatAttachments image rows so the
 * chat UI can reserve the correct aspect ratio before the image loads and
 * avoid layout shift for pre-existing attachments.
 *
 * The migration itself only scans rows and schedules one action per image —
 * the action does the R2 fetch + header parse + patch. That keeps the mutation
 * short and pushes the network work into the scheduler.
 *
 * Run with:
 *   npx convex run migrations:runAll
 * or just this one:
 *   npx convex run migrations:backfillAttachmentDimensions
 */
export const backfillAttachmentDimensions = migrations.define({
	table: 'chatAttachments',
	migrateOne: async (ctx, doc) => {
		if (doc.width !== undefined && doc.height !== undefined) return;
		if (!doc.mediaType.toLowerCase().startsWith('image/')) return;
		await ctx.scheduler.runAfter(0, internal.chatAttachments.backfillDimensions, {
			id: doc._id,
			key: doc.key,
			mediaType: doc.mediaType
		});
	}
});

export const runAll = migrations.runner([internal.migrations.backfillAttachmentDimensions]);
