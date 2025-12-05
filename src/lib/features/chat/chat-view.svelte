<script lang="ts">
	import { useChatLayout, useChatView } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/chat/components/model-picker-basic.svelte';
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import ChatMessage from './chat-message.svelte';
	import { ModelIdCtx } from '$lib/context.svelte';

	const chatLayoutState = useChatLayout();
	const chatViewState = useChatView();

	const driven = $derived(chatLayoutState.drivingId === chatLayoutState.chatId);

	const modelId = ModelIdCtx.get();
</script>

<div class="flex flex-col h-full items-center">
	<div class="flex flex-col w-full max-w-2xl flex-1 py-4">
		<div class="flex-1 flex flex-col gap-2 pb-4">
			{#each chatViewState.chatQuery.data?.messages ?? [] as message}
				<ChatMessage {message} {driven} />
			{/each}
		</div>

		<div class="sticky bottom-4">
			<PromptInput.Root bind:modelId={modelId.current} onSubmit={chatLayoutState.handleSubmit}>
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
