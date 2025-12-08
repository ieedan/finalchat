import { useQueryWithFallback, type Query } from '$lib/convex.svelte';
import { api } from '$lib/convex/_generated/api';
import type { Doc, Id } from '$lib/convex/_generated/dataModel';
import type { User } from '@workos-inc/node';
import type { OnSubmit } from './components/prompt-input/prompt-input.svelte.js';
import { useConvexClient } from 'convex-svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { Context, PersistedState } from 'runed';
import type { ConvexClient } from 'convex/browser';
import type { RemoteQuery } from '@sveltejs/kit';
import { getApiKey } from '../api-keys/api-keys.remote.js';
import { useLocalApiKey } from '../api-keys/local-key-storage.svelte.js';
import { useCachedQuery, type QueryResult } from '$lib/cache/cached-query.svelte.js';
import { SvelteSet } from 'svelte/reactivity';

type ChatLayoutOptions = {
	user: User;
	userSettings: Doc<'userSettings'> | null;
	chats: Doc<'chat'>[];
	apiKey: Doc<'apiKeys'> | null;
};

class ChatLayoutState {
	createdMessages = new SvelteSet<Id<'messages'>>();
	userSettingsQuery: Query<typeof api.userSettings.get>;
	chatsQuery: Query<typeof api.chat.getAll>;
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

		this.chatsQuery = useQueryWithFallback(
			api.chat.getAll,
			{},
			{
				fallback: this.opts.chats
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
		return (
			this.opts.apiKey?.key ?? this.localApiKey.current ?? this.apiKeysQuery.current?.key ?? null
		);
	}

	handleSubmit: OnSubmit = async ({ input, modelId, attachments }) => {
		const { chatId, assistantMessageId } = await this.client.mutation(api.messages.create, {
			chatId: this.chatId,
			apiKey: this.apiKey ?? '',
			prompt: {
				input,
				modelId,
				attachments
			}
		});

		this.createdMessages.add(assistantMessageId);

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
	chatId: Id<'chat'>;
};

class ChatViewState {
	chatQuery: QueryResult<Doc<'chat'> & { messages: Doc<'messages'>[] }>;
	constructor(readonly opts: ChatViewOptions) {
		this.chatQuery = useCachedQuery(api.chat.get, {
			chatId: this.opts.chatId
		});
	}
}

const ChatViewCtx = new Context<ChatViewState>('chat-view-state');

export function setupChatView(opts: ChatViewOptions) {
	return ChatViewCtx.set(new ChatViewState(opts));
}

export function useChatView() {
	return ChatViewCtx.get();
}
