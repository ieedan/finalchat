import { useQueryWithFallback, type Query } from '$lib/convex.svelte';
import { api } from '$lib/convex/_generated/api';
import type { Doc, Id } from '$lib/convex/_generated/dataModel';
import type { User } from '@workos-inc/node';
import type {
	ChatPromptAttachment,
	OnSubmit
} from './components/prompt-input/prompt-input.svelte.js';
import type { ReasoningEffort } from '$lib/convex/schema.js';
import { useConvexClient, useQuery } from 'convex-svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { Context, PersistedState } from 'runed';
import type { ConvexClient, OptimisticLocalStore } from 'convex/browser';
import type { RemoteQuery } from '@sveltejs/kit';
import { getApiKey } from '../api-keys/api-keys.remote.js';
import { useLocalApiKey } from '../api-keys/local-key-storage.svelte.js';
import { useCachedQuery, type QueryResult } from '$lib/cache/cached-query.svelte.js';
import { SvelteSet } from 'svelte/reactivity';
import type * as OpenRouter from '../models/openrouter';
import { supportsReasoning } from '../models/openrouter';
import type { MessageWithAttachments } from '$lib/convex/chats.utils.js';
import { BASIC_MODELS, DEFAULT_ENABLED_MODEL_IDS } from '$lib/ai.js';
import type { Model, ModelId } from './types.js';
import { ConvexError } from 'convex/values';
import { convexErrorMessage } from '$lib/convex/rateLimitError';
import { truncateRight } from '$lib/utils/strings';
import { untrack } from 'svelte';
import { toast } from 'svelte-sonner';

type ChatLayoutOptions = {
	user: User | null;
	userSettings: Doc<'userSettings'> | null;
	chats: Doc<'chats'>[];
	apiKey: Doc<'apiKeys'> | null;
	models: (OpenRouter.Model & { lab: string | null })[];
};

class ChatLayoutState {
	createdMessages = new SvelteSet<Id<'messages'>>();
	userSettingsQuery: Query<typeof api.userSettings.get>;
	chatsQuery: Query<typeof api.chats.getAll>;
	apiKeysQuery: RemoteQuery<Doc<'apiKeys'> | null>;
	localApiKey: PersistedState<string | null>;
	client: ConvexClient;
	/** An empty chat created ahead of time so starting a new chat doesn't wait on chat creation. */
	draftChatId = $state<Id<'chats'> | null>(null);
	#preparingDraft = false;
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
			api.chats.getAll,
			{},
			{
				fallback: this.opts.chats
			}
		);

		this.apiKeysQuery = getApiKey();
		this.localApiKey = useLocalApiKey();

		// keep a draft chat ready (and its query subscribed) so a new chat can open instantly
		$effect(() => {
			if (!this.user || this.draftChatId !== null) return;
			untrack(() => this.prepareDraft());
		});
		useQuery(api.chats.get, () => (this.draftChatId ? { chatId: this.draftChatId } : 'skip'));

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleStop = this.handleStop.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
		this.handleBranchEdit = this.handleBranchEdit.bind(this);
	}

	get isAdvancedMode() {
		return !this.userSettings || this.userSettings?.onboarding?.mode === 'advanced';
	}

	get models() {
		// limit users without api keys to free models
		if (this.apiKey === null && this.user !== null) {
			return this.opts.models.filter((model) => model.id.endsWith(':free'));
		}
		return this.opts.models;
	}

	get favoriteModelIds() {
		if (this.apiKey === null && this.user !== null) {
			// get 1 model for each unique lab providing free inference
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const providersMap = new Map<string, ModelId>();
			this.models.forEach((model) => {
				if (providersMap.has(model.lab ?? 'unknown')) return;
				providersMap.set(model.lab ?? 'unknown', model.id);
			});
			return Array.from(providersMap.values());
		}

		return this.userSettings?.favoriteModelIds
			? this.userSettings?.favoriteModelIds
			: DEFAULT_ENABLED_MODEL_IDS;
	}

	get availableBasicModels(): Model[] {
		if (this.apiKey === null && this.user !== null) {
			return this.models.filter((model) => model.id.endsWith(':free'));
		}

		return BASIC_MODELS;
	}

	get enabledModels() {
		return this.models.filter((model) => this.favoriteModelIds.includes(model.id));
	}

	modelSupportsReasoning(modelId: ModelId | null): boolean {
		const model = this.models.find((m) => m.id === modelId);
		return model ? supportsReasoning(model) : false;
	}

	get user() {
		return this.opts.user;
	}

	get userSettings() {
		return this.userSettingsQuery.data;
	}

	get hasOnboarded() {
		return this.userSettings?.onboarding?.completed;
	}

	get chatId() {
		return page.params.chatId as Id<'chats'> | undefined;
	}

	get isChatOwner() {
		return this.chatId
			? this.chatsQuery.data?.find((c) => c._id === this.chatId)?.userId === this.user?.id
			: false;
	}

	get apiKey(): string | null {
		return (
			this.localApiKey.current ?? this.apiKeysQuery.current?.key ?? this.opts.apiKey?.key ?? null
		);
	}

	async prepareDraft() {
		if (this.#preparingDraft) return;
		this.#preparingDraft = true;
		try {
			this.draftChatId = await this.client.mutation(api.chats.getOrCreateDraft, {});
		} catch (error) {
			// not critical, new chats will just be created when the first message is sent
			console.error('Failed to prepare draft chat', error);
		} finally {
			this.#preparingDraft = false;
		}
	}

	async handleStop() {
		if (!this.chatId) return;
		await this.client.mutation(api.chats.stopGenerating, {
			chatId: this.chatId
		});
	}

	async handleBranchEdit(
		messageId: Id<'messages'>,
		{
			input,
			modelId,
			attachments,
			reasoningEffort
		}: {
			input: string;
			modelId: ModelId;
			attachments: ChatPromptAttachment[];
			reasoningEffort: ReasoningEffort;
		}
	) {
		if (!this.user) throw new Error('You must be signed in to branch a message!');

		const model = this.models.find((m) => m.id === modelId);
		if (!model) throw new Error(`Model with id: ${modelId} not found`);

		try {
			const { newChatId, newAssistantMessageId } = await this.client.mutation(
				api.chats.branchFromMessage,
				{
					message: {
						_id: messageId,
						role: 'user',
						modelId,
						supportedParameters: model.supported_parameters,
						inputModalities: model.architecture.input_modalities,
						outputModalities: model.architecture.output_modalities,
						reasoningEffort:
							this.isAdvancedMode && this.modelSupportsReasoning(modelId)
								? reasoningEffort
								: 'default',
						content: input,
						attachments
					},
					apiKey: this.apiKey ?? ''
				}
			);

			if (newAssistantMessageId) {
				this.createdMessages.add(newAssistantMessageId);
			}

			await goto(resolve(`/chat/${newChatId}`));
		} catch (error) {
			if (error instanceof ConvexError) {
				throw new Error(convexErrorMessage(error.data), { cause: error });
			}
			throw error;
		}
	}

	async handleEdit(
		messageId: Id<'messages'>,
		{
			input,
			modelId,
			attachments,
			reasoningEffort
		}: {
			input: string;
			modelId: ModelId;
			attachments: ChatPromptAttachment[];
			reasoningEffort: ReasoningEffort;
		}
	) {
		if (!this.user) throw new Error('You must be signed in to edit messages!');

		const model = this.models.find((m) => m.id === modelId);
		if (!model) throw new Error(`Model with id: ${modelId} not found`);

		try {
			const { assistantMessageId } = await this.client.mutation(api.messages.editMessage, {
				messageId,
				apiKey: this.apiKey ?? '',
				prompt: {
					input,
					modelId,
					attachments,
					supportedParameters: model.supported_parameters,
					inputModalities: model.architecture.input_modalities,
					outputModalities: model.architecture.output_modalities,
					reasoningEffort:
						this.isAdvancedMode && this.modelSupportsReasoning(modelId)
							? reasoningEffort
							: 'default'
				}
			});

			this.createdMessages.add(assistantMessageId);
		} catch (error) {
			if (error instanceof ConvexError) {
				throw new Error(convexErrorMessage(error.data), { cause: error });
			}

			throw error;
		}
	}

	handleSubmit: OnSubmit = async ({ input, modelId, attachments, reasoningEffort }) => {
		const user = this.user;
		if (!user) throw new Error('You must be signed in to start chatting!');

		const model = this.models.find((m) => m.id === modelId);
		if (!model) throw new Error(`Model with id: ${modelId} not found`);

		const currentChatId = this.chatId;
		// when starting a new chat use the draft so we can navigate to it right away
		const draftChatId = currentChatId ? undefined : (this.draftChatId ?? undefined);
		const isFreeUser = (this.apiKey ?? '').trim() === '';

		const prompt = {
			input,
			modelId,
			attachments,
			supportedParameters: model.supported_parameters,
			inputModalities: model.architecture.input_modalities,
			outputModalities: model.architecture.output_modalities,
			// when not advanced mode or model doesn't support reasoning, send 'default'
			reasoningEffort:
				this.isAdvancedMode && this.modelSupportsReasoning(modelId) ? reasoningEffort : 'default'
		} as const;

		const mutation = this.client.mutation(
			api.messages.create,
			{
				chatId: currentChatId,
				draftChatId,
				apiKey: this.apiKey ?? '',
				prompt
			},
			{
				optimisticUpdate: (store) => {
					const chatId = currentChatId ?? draftChatId;
					if (!chatId) return;
					addOptimisticUserMessage(store, {
						chatId,
						userId: user.id,
						prompt,
						newChatTitle: draftChatId
							? isFreeUser
								? truncateRight(input, 30)
								: 'Untitled Chat'
							: undefined
					});
				}
			}
		);
		// errors are handled below once we've navigated
		mutation.catch(() => {});

		if (draftChatId) {
			await goto(resolve(`/chat/${draftChatId}`));
			// the draft is now in use, this will prepare a new one
			this.draftChatId = null;
		}

		try {
			const { chatId, assistantMessageId } = await mutation;

			this.createdMessages.add(assistantMessageId);

			if (this.chatId !== chatId) {
				await goto(resolve(`/chat/${chatId}`));
			}
		} catch (error) {
			const message = error instanceof ConvexError ? convexErrorMessage(error.data) : String(error);

			if (draftChatId) {
				// we already left the new chat page so bring the user back with their input restored
				await goto(`${resolve('/chat')}?q=${encodeURIComponent(input)}`, { replaceState: true });
				toast.error(message);
			}

			if (error instanceof ConvexError) {
				throw new Error(message, { cause: error });
			}

			throw error;
		}
	};
}

/**
 * Optimistically shows the user's message (including attachments) in the chat while
 * `messages.create` is in flight.
 */
function addOptimisticUserMessage(
	store: OptimisticLocalStore,
	{
		chatId,
		userId,
		prompt,
		newChatTitle
	}: {
		chatId: Id<'chats'>;
		userId: string;
		prompt: {
			input: string;
			modelId: string;
			attachments: ChatPromptAttachment[];
			supportedParameters: string[];
			inputModalities: string[];
			outputModalities: string[];
			reasoningEffort: ReasoningEffort;
		};
		/** Set when the message starts a new chat. */
		newChatTitle?: string;
	}
) {
	const now = Date.now();
	const chat = store.getQuery(api.chats.get, { chatId });
	// non owners fork the chat on the server so there is nothing to show here
	if (!chat || chat.userId !== userId) return;

	const messageId = `optimistic:${now}` as Id<'messages'>;

	const updatedChat = {
		...chat,
		...(newChatTitle !== undefined ? { title: newChatTitle, draft: false } : {}),
		updatedAt: now
	};

	store.setQuery(
		api.chats.get,
		{ chatId },
		{
			...updatedChat,
			messages: [
				...chat.messages,
				{
					_id: messageId,
					_creationTime: now,
					userId,
					chatId,
					role: 'user',
					content: prompt.input,
					chatSettings: {
						modelId: prompt.modelId,
						supportedParameters: prompt.supportedParameters,
						inputModalities: prompt.inputModalities,
						outputModalities: prompt.outputModalities,
						reasoningEffort: prompt.reasoningEffort
					},
					attachments: prompt.attachments.map((attachment) => ({
						_id: `optimistic:${attachment.key}` as Id<'chatAttachments'>,
						_creationTime: now,
						userId,
						chatId,
						messageId,
						key: attachment.key,
						url: attachment.url,
						mediaType: attachment.mediaType,
						fileName: attachment.fileName,
						width: attachment.width,
						height: attachment.height
					}))
				}
			]
		}
	);

	const chats = store.getQuery(api.chats.getAll, {});
	if (chats) {
		const { messages: _messages, ...chatDoc } = updatedChat;
		store.setQuery(api.chats.getAll, {}, [chatDoc, ...chats.filter((c) => c._id !== chatId)]);
	}
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
