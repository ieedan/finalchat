import type { ActionCtx } from '../../../convex/_generated/server';
import type { Id } from '../../../convex/_generated/dataModel';

export type ContextType = {
	env: {
		GITHUB_TOKEN: string | undefined;
	};
	ctx: ActionCtx;
	chatId: Id<'chats'>;
};
