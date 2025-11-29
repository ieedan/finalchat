import { useQueryWithFallback, type Query } from '$lib/convex.svelte';
import { api } from '$lib/convex/_generated/api';
import type { Doc } from '$lib/convex/_generated/dataModel';
import type { User } from '@workos-inc/node';
import { Context } from 'runed';

type ChatStateOptions = {
	user: User;
	userSettings: Doc<'userSettings'> | null;
};

class ChatState {
	userSettingsQuery: Query<typeof api.userSettings.get>;
	constructor(readonly opts: ChatStateOptions) {
		this.userSettingsQuery = useQueryWithFallback(
			api.userSettings.get,
			{},
			{
				fallback: this.opts.userSettings
			}
		);
	}

	get user() {
		return this.opts.user;
	}

	get hasOnboarded() {
		return this.userSettingsQuery.data?.onboarding?.completed;
	}
}

export const ChatCtx = new Context<ChatState>('chat-context');

export function setupChat({
	user,
	userSettings
}: {
	user: User;
	userSettings: Doc<'userSettings'> | null;
}) {
	return ChatCtx.set(new ChatState({ user, userSettings }));
}
