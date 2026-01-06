<script lang="ts">
	import { useChatLayout, useChatView } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/models/components/models-picker-basic.svelte';
	import ModelPickerAdvanced from '$lib/features/models/components/models-picker-advanced.svelte';
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import ChatMessage from './chat-message.svelte';
	import { ModelIdCtx } from '$lib/context.svelte';
	import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte';
	import { onMount } from 'svelte';
	import { IsMounted, PersistedState } from 'runed';
	import { cn } from '$lib/utils';
	import { ChatAttachmentUploader } from './chat-attachment-uploader.svelte.js';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ShareButton from './chat-share-button.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { EyeIcon, MessageCircleOffIcon, ArrowLeftIcon } from '@lucide/svelte';
	import * as Empty from '$lib/components/ui/empty';
	import { Button } from '$lib/components/ui/button';

	const chatLayoutState = useChatLayout();
	const chatViewState = useChatView();

	const modelId = ModelIdCtx.get();

	let scrollContainer = $state<HTMLElement>();

	const autoScroll = new UseAutoScroll();
	onMount(() => {
		autoScroll.ref = scrollContainer;
	});

	const isMounted = new IsMounted();

	const chatAttachmentUploader = new ChatAttachmentUploader();

	const attachmentsList = new PersistedState<{ url: string; key: string; mediaType: string }[]>(
		'chat-attachments',
		[]
	);

	const sidebar = Sidebar.useSidebar();

	const selectedModel = $derived(
		chatLayoutState.models.find((model) => model.id === modelId.current)
	);

	const lastAssistantMessage = $derived.by(() => {
		return chatViewState.chat?.messages.findLast((message) => message.role === 'assistant');
	});

	const isChatOwner = $derived(chatViewState.chatQuery.data?.userId === chatLayoutState.user?.id);
</script>

{#if chatViewState.chat !== null}
	<header class="sticky top-0">
		<div class="px-3 py-2.5 w-full flex items-center bg-background justify-between z-20 h-14">
			<div class="flex items-center gap-4">
				<div
					data-visible={sidebar.isMobile || !sidebar.open}
					class="size-9 data-[visible=false]:w-0 transition-all duration-200"
				></div>
				<span class="text-foreground text-sm">{chatViewState.chatQuery.data?.title}</span>
			</div>
			<div class="flex items-center gap-2">
				{#if chatViewState.chatQuery.data}
					{#if isChatOwner}
						<ShareButton chat={chatViewState.chatQuery.data} />
					{:else if chatViewState.chatQuery.data.public}
						<Badge><EyeIcon /> Viewing a shared chat</Badge>
					{/if}
				{/if}
			</div>
		</div>
		{#if !autoScroll.isAtTop}
			<div class="absolute w-full h-[24px] bg-background mask-b-from-0% -bottom-[14px] z-19"></div>
		{/if}
	</header>
	<div
		bind:this={scrollContainer}
		class={cn('flex flex-col h-full max-h-full overflow-y-auto items-center', {
			'scroll-smooth': isMounted.current
		})}
	>
		<div class="flex flex-col w-full max-w-3xl px-4 flex-1">
			{#if !isChatOwner && chatViewState.chat}
				<div
					class="flex flex-col w-full max-w-3xl mt-4 px-4 border border-border rounded-md py-3 bg-accent"
				>
					<p class="text-sm">
						You're viewing a shared chat. Start your own chat
						<a href="/chat" class="underline underline-offset-2">here</a>.
					</p>
				</div>
			{/if}
			<div class="flex-1 flex flex-col gap-2 py-4">
				{#each chatViewState.chat?.messages ?? [] as message (message._id)}
					<ChatMessage
						{message}
						apiKey={chatLayoutState.apiKey}
						systemPrompt={chatLayoutState.userSettingsQuery.data?.systemPrompt ?? null}
						bind:createdMessages={chatLayoutState.createdMessages}
					/>
				{/each}
			</div>

			<div
				class="sticky bottom-0 pb-4 has-[[data-slot=prompt-input-banner][data-state=open]]:pt-8 bg-background rounded-t-lg transition-[padding]"
			>
				{#if !autoScroll.isAtBottom}
					<div class="absolute w-full h-[24px] bg-background mask-t-from-0% -top-[14px] z-19"></div>
				{/if}
				<PromptInput.Root
					bind:modelId={modelId.current}
					generating={chatViewState.chatQuery.data?.generating}
					onSubmit={(opts) => {
						autoScroll.scrollToBottom(false, 'instant');
						return chatLayoutState.handleSubmit(opts);
					}}
					onUpload={chatAttachmentUploader.uploadMany}
					onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
					bind:attachments={attachmentsList.current}
					class="group/prompt-input z-20"
				>
					<PromptInput.Banner dismissedByError dismissed={chatLayoutState.user !== null}>
						<PromptInput.BannerContent>
							<p>
								<a href="/auth/login" class="font-medium underline">Sign in</a> to start chatting!
							</p>
						</PromptInput.BannerContent>
					</PromptInput.Banner>
					<PromptInput.ScrollToBottom
						isNearBottom={autoScroll.isNearBottom}
						scrollToBottom={autoScroll.scrollToBottom}
					/>
					<PromptInput.Content>
						<PromptInput.Textarea placeholder="Ask me anything..." />
						<PromptInput.Footer class="justify-between">
							<div class="flex items-center gap-2">
								{#if chatLayoutState.isAdvancedMode}
									<ModelPickerAdvanced />
								{:else}
									<ModelPickerBasic />
								{/if}
								<PromptInput.AttachmentButton />
							</div>
							<div class="flex items-center gap-2">
								{#if chatLayoutState.isAdvancedMode}
									{#if lastAssistantMessage?.meta.tokenUsage !== undefined && selectedModel?.context_length !== undefined}
										<PromptInput.ContextIndicator
											class="hidden md:block"
											tokensUsed={lastAssistantMessage.meta.tokenUsage}
											contextLength={selectedModel.context_length}
										/>
									{/if}
								{/if}
								<PromptInput.Submit disabled={chatLayoutState.user === null} />
							</div>
						</PromptInput.Footer>
					</PromptInput.Content>
				</PromptInput.Root>
			</div>
		</div>
	</div>
{:else}
	<Empty.Root class="h-full border-none">
		<Empty.Content>
			<Empty.Header>
				<Empty.Media variant="icon" class="size-14 rounded-xl [&_svg]:size-7">
					<MessageCircleOffIcon />
				</Empty.Media>
				<Empty.Title class="text-xl">Chat Not Found</Empty.Title>
				<Empty.Description>We couldn't find the chat you were looking for.</Empty.Description>
			</Empty.Header>
			<Button href="/chat" variant="outline" class="gap-2">
				<ArrowLeftIcon class="size-4" />
				Start a new chat
			</Button>
		</Empty.Content>
	</Empty.Root>
{/if}
