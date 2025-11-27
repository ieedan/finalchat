import type { User } from '@workos-inc/node';
import { Context } from 'runed';

type ChatStateOptions = {
	user: User;
};

class ChatState {
	constructor(readonly opts: ChatStateOptions) {}

	get user() {
		return this.opts.user;
	}
}

export const ChatCtx = new Context<ChatState>('chat-context');

export function setupChat({ user }: { user: User }) {
	return ChatCtx.set(new ChatState({ user }));
}
