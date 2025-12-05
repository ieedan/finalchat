import { useQueryWithFallback, type Query } from '$lib/convex.svelte';
import { api } from '$lib/convex/_generated/api';
import type { Doc, Id } from '$lib/convex/_generated/dataModel';
import type { User } from '@workos-inc/node';
import type { OnSubmit } from './components/prompt-input/prompt-input.svelte.js';
import { useConvexClient } from 'convex-svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Infer } from 'convex/values';
import type { ChatMessageAssistant, ChatMessageUser } from '$lib/convex/schema';
import { env } from '$lib/env.client.js';
import { useStream } from '$lib/utils/persistent-text-streaming.svelte.js';
import type { StreamId } from '@convex-dev/persistent-text-streaming';
import { Context, PersistedState } from 'runed';
import type { ConvexClient } from 'convex/browser';
import type { RemoteQuery } from '@sveltejs/kit';
import { getApiKey } from '../api-keys/api-keys.remote.js';
import { useLocalApiKey } from '../api-keys/local-key-storage.svelte.js';

type ChatLayoutOptions = {
	user: User;
	userSettings: Doc<'userSettings'> | null;
	apiKey: Doc<'apiKeys'> | null;
};

class ChatLayoutState {
	drivingId = $state<Id<'chat'> | undefined>(undefined);
	userSettingsQuery: Query<typeof api.userSettings.get>;
	apiKeysQuery: RemoteQuery<Doc<'apiKeys'> | null>;
	localApiKey: PersistedState<string | null>;
	client: ConvexClient;
	constructor(readonly opts: ChatLayoutOptions) {
		this.client = useConvexClient();
		this.userSettingsQuery = useQueryWithFallback(
			api.userSettings.get,
			{},
			{
				fallback: this.opts.userSettings
			}
		);

		this.apiKeysQuery = getApiKey();
		this.localApiKey = useLocalApiKey();

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	get user() {
		return this.opts.user;
	}

	get hasOnboarded() {
		return this.userSettingsQuery.data?.onboarding?.completed;
	}

	get chatId() {
		return page.params.chatId as Id<'chat'> | undefined;
	}

	get apiKey(): string | null {
		return this.opts.apiKey?.key ?? this.localApiKey.current ?? this.apiKeysQuery.current?.key ?? null;
	}

	handleSubmit: OnSubmit = async ({ input, modelId }) => {
		const { chatId } = await this.client.mutation(api.messages.create, {
			chatId: this.chatId,
			prompt: {
				input,
				modelId
			}
		});

		this.drivingId = chatId;

		if (this.chatId !== chatId) {
			await goto(resolve(`/chat/${chatId}`));
		}
	};
}

const ChatLayoutCtx = new Context<ChatLayoutState>('chat-layout-state');

export function setupChatLayout(opts: ChatLayoutOptions) {
	return ChatLayoutCtx.set(new ChatLayoutState(opts));
}

export function useChatLayout() {
	return ChatLayoutCtx.get();
}

type ChatViewOptions = {
	chat: Doc<'chat'> & { messages: Doc<'messages'>[] };
};

class ChatViewState {
	chatQuery: Query<typeof api.chat.get>;
	constructor(readonly opts: ChatViewOptions) {
		this.chatQuery = useQueryWithFallback(
			api.chat.get,
			{
				chatId: this.opts.chat._id
			},
			{
				fallback: this.opts.chat
			}
		);
	}
}

const ChatViewCtx = new Context<ChatViewState>('chat-view-state');

export function setupChatView(opts: ChatViewOptions) {
	return ChatViewCtx.set(new ChatViewState(opts));
}

export function useChatView() {
	return ChatViewCtx.get();
}

export function useContent(
	message: Infer<typeof ChatMessageUser> | Infer<typeof ChatMessageAssistant>,
	opts: {
		driven: boolean;
		accessToken: string | undefined;
		apiKey: string | null;
	}
) {
	console.log('useContent', { message, driven: opts.driven, accessToken: opts.accessToken, apiKey: opts.apiKey });
	let content = $state<string | null>(null);

	if (message.content !== undefined) {
		content = message.content;
	}

	let streamBody: ReturnType<typeof useStream> | undefined;
	if (content === null && message.role === 'assistant') {
		console.log('useStream', { message, driven: opts.driven, accessToken: opts.accessToken });
		streamBody = useStream(
			api.messages.getChatBody,
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			new URL('/messages/stream', env.PUBLIC_CONVEX_SITE_URL),
			opts.driven,
			{
				streamId: message.streamId as StreamId,
				chatId: message.chatId,
				authToken: opts.accessToken,
				apiKey: opts.apiKey
			}
		);
	}

	return {
		get current() {
			return content ?? streamBody?.body.text ?? '';
		}
	};
}
