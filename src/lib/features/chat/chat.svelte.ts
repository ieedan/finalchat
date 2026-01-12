import { useQueryWithFallback, type Query } from '$lib/convex.svelte';
import { api } from '$lib/convex/_generated/api';
import type { Doc, Id } from '$lib/convex/_generated/dataModel';
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
import type * as OpenRouter from '../models/openrouter';
import type { MessageWithAttachments } from '$lib/convex/chats.utils.js';
import type { User } from '$lib/convex/users.utils.js';

type ChatLayoutOptions = {
	user: User | null;
	chats: Doc<'chats'>[];
	apiKey: Doc<'apiKeys'> | null;
	models: (OpenRouter.Model & { lab: string | null })[];
};

class ChatLayoutState {
	createdMessages = new SvelteSet<Id<'messages'>>();
	userQuery: Query<typeof api.users.get>;
	chatsQuery: Query<typeof api.chats.getAll>;
	apiKeysQuery: RemoteQuery<Doc<'apiKeys'> | null>;
	localApiKey: PersistedState<string | null>;
	client: ConvexClient;
	constructor(readonly opts: ChatLayoutOptions) {
		this.client = useConvexClient();
		this.userQuery = useQueryWithFallback(
			api.users.get,
			{},
			{
				fallback: this.opts.user
			}
		);

		this.chatsQuery = useQueryWithFallback(
			api.chats.getAll,
			{},
			{
				fallback: this.opts.chats
			}
		);

		this.apiKeysQuery = getApiKey();
		this.localApiKey = useLocalApiKey();

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	get isAdvancedMode() {
		return this.userQuery.data?.settings?.mode === 'advanced';
	}

	get models() {
		return this.opts.models;
	}

	get enabledModels() {
		return this.models.filter((model) =>
			this.userQuery.data?.settings?.favoriteModelIds?.includes(model.id)
		);
	}

	get user() {
		return this.userQuery.data;
	}

	get hasOnboarded() {
		return this.userQuery.data?.onboarding?.completed;
	}

	get chatId() {
		return page.params.chatId as Id<'chats'> | undefined;
	}

	get isChatOwner() {
		return this.chatId
			? this.chatsQuery.data?.find((c) => c._id === this.chatId)?.workosUserId ===
					this.user?.workosUserId
			: false;
	}

	get apiKey(): string | null {
		return (
			this.localApiKey.current ?? this.apiKeysQuery.current?.key ?? this.opts.apiKey?.key ?? null
		);
	}

	handleSubmit: OnSubmit = async ({ input, modelId, attachments }) => {
		if (!this.user) throw new Error('You must be signed in to start chatting!');
		if (!this.apiKey)
			throw new Error('You need to have an API key setup before you can start chatting!');

		const model = this.models.find((m) => m.id === modelId);
		if (!model) throw new Error(`Model with id: ${modelId} not found`);
		const { chatId, assistantMessageId } = await this.client.mutation(api.messages.create, {
			chatId: this.chatId,
			apiKey: this.apiKey ?? '',
			prompt: {
				input,
				modelId,
				attachments,
				supportedParameters: model.supported_parameters,
				inputModalities: model.architecture.input_modalities,
				outputModalities: model.architecture.output_modalities
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
	chatId: Id<'chats'>;
};

class ChatViewState {
	chatQuery: QueryResult<(Doc<'chats'> & { messages: MessageWithAttachments[] }) | null>;
	constructor(readonly opts: ChatViewOptions) {
		this.chatQuery = useCachedQuery(api.chats.get, {
			chatId: this.opts.chatId
		});
	}

	get chat() {
		return this.chatQuery.data;
	}
}

const ChatViewCtx = new Context<ChatViewState>('chat-view-state');

export function setupChatView(opts: ChatViewOptions) {
	return ChatViewCtx.set(new ChatViewState(opts));
}

export function useChatView() {
	return ChatViewCtx.get();
}
