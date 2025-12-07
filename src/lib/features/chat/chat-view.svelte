<script lang="ts">
	import { useChatLayout, useChatView } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/chat/components/model-picker-basic.svelte';
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import ChatMessage from './chat-message.svelte';
	import { ModelIdCtx } from '$lib/context.svelte';
	import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte';
	import { onMount } from 'svelte';
	import { IsMounted } from 'runed';
	import { cn } from '$lib/utils';

	const chatLayoutState = useChatLayout();
	const chatViewState = useChatView();

	const modelId = ModelIdCtx.get();

	let scrollContainer = $state<HTMLElement>();

	const autoScroll = new UseAutoScroll();
	onMount(() => {
		autoScroll.ref = scrollContainer;
	});

	const isMounted = new IsMounted();
</script>

<svelte:head>
	<title>{chatViewState.chatQuery.data?.title}</title>
</svelte:head>

<div
	bind:this={scrollContainer}
	class={cn('flex flex-col h-full max-h-svh overflow-y-auto items-center', {
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
								<ModelPickerBasic />
							{:else}
								<ModelPickerBasic />
							{/if}
						</div>
						<PromptInput.Submit />
					</PromptInput.Footer>
				</PromptInput.Content>
			</PromptInput.Root>
		</div>
	</div>
</div>
