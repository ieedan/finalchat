import type { Query } from '$lib/convex';
import { api } from '$lib/convex/_generated/api';
import type { User } from '@workos-inc/node';
import { useQuery } from 'convex-svelte';
import { Context } from 'runed';

type ChatStateOptions = {
	user: User;
};

class ChatState {
	userSettingsQuery: Query<typeof api.userSettings.get>;
	constructor(readonly opts: ChatStateOptions) {
		this.userSettingsQuery = useQuery(api.userSettings.get, {});
	}

	get user() {
		return this.opts.user;
	}

	get hasOnboarded() {
		return this.userSettingsQuery.data?.onboarding?.completed;
	}
}

export const ChatCtx = new Context<ChatState>('chat-context');

export function setupChat({ user }: { user: User }) {
	return ChatCtx.set(new ChatState({ user }));
}
