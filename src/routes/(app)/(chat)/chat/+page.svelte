<script lang="ts">
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/chat/components/model-picker-basic.svelte';
	import { PersistedState } from 'runed';

	const chatState = useChatLayout();

	const modelId = new PersistedState('modelId', null);
</script>

<div class="w-full min-h-svh items-center justify-center flex">
	<PromptInput.Root
		bind:modelId={modelId.current}
		onSubmit={chatState.handleSubmit}
		class="w-full max-w-2xl"
	>
		<PromptInput.Content>
			<PromptInput.Textarea placeholder="Ask me anything..." />
			<PromptInput.Footer class="justify-between">
				<div class="flex items-center gap-2">
					{#if chatState.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
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
