<script lang="ts">
	import { useChatLayout, useChatView } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/chat/components/model-picker-basic.svelte';
	import ModelPickerAdvanced from '$lib/features/chat/components/model-picker-advanced.svelte';
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import ChatMessage from './chat-message.svelte';
	import { ModelIdCtx } from '$lib/context.svelte';
	import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte';
	import { onMount } from 'svelte';
	import { IsMounted, PersistedState } from 'runed';
	import { cn } from '$lib/utils';
	import { ChatAttachmentUploader } from './chat-attachment-uploader.svelte.js';
	import * as Sidebar from '$lib/components/ui/sidebar';
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

	const attachmentsList = new PersistedState<{ url: string; key: string }[]>(
		'chat-attachments',
		[]
	);

	const sidebar = Sidebar.useSidebar();
</script>

<svelte:head>
	<title>{chatViewState.chatQuery.data?.title}</title>
</svelte:head>

<header class="sticky top-0">
	<div class="px-3 py-2.5 w-full flex items-center justify-between z-20">
		<div class="flex items-center gap-2">
			{#if sidebar.isMobile || !sidebar.open}
				<div class="size-9"></div>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline">
				Share
			</Button>
		</div>
	</div>
	<div class="absolute w-full h-[24px] bg-background mask-b-from-0% -bottom-[14px] z-19"></div>
</header>
<div
	bind:this={scrollContainer}
	class={cn('flex flex-col h-full max-h-full overflow-y-auto items-center', {
		'scroll-smooth': isMounted.current
	})}
>
	<div class="flex flex-col w-full max-w-3xl px-4 flex-1">
		<div class="flex-1 flex flex-col gap-2 py-4">
			{#each chatViewState.chatQuery.data?.messages ?? [] as message (message._id)}
				<ChatMessage {message} />
			{/each}
		</div>

		<div class="sticky bottom-0 pb-4 bg-background rounded-t-lg">
			<PromptInput.Root
				bind:modelId={modelId.current}
				generating={chatViewState.chatQuery.data?.generating}
				onSubmit={chatLayoutState.handleSubmit}
				onUpload={chatAttachmentUploader.uploadMany}
				onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
				bind:attachments={attachmentsList.current}
				class="group/prompt-input"
			>
				<PromptInput.ScrollToBottom
					isNearBottom={autoScroll.isNearBottom}
					scrollToBottom={autoScroll.scrollToBottom}
				/>
				<PromptInput.Content>
					<PromptInput.Textarea placeholder="Ask me anything..." />
					<PromptInput.Footer class="justify-between">
						<div class="flex items-center gap-2">
							{#if chatLayoutState.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
								<ModelPickerAdvanced />
							{:else}
								<ModelPickerBasic />
							{/if}
							<PromptInput.AttachmentButton />
						</div>
						<PromptInput.Submit />
					</PromptInput.Footer>
				</PromptInput.Content>
			</PromptInput.Root>
		</div>
	</div>
</div>
