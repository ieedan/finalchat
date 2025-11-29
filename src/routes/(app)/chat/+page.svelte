<script lang="ts">
	import { ChatCtx } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/chat/components/model-picker-basic.svelte';
	import * as PromptInput from '$lib/features/chat/components/prompt-input';

	const chatState = ChatCtx.get();

	async function handleSubmit(input: string) {}
</script>

<div class="flex flex-col h-full items-center">
	<div class="flex flex-col w-full max-w-2xl flex-1 py-4">
	<div class="flex-1"></div>

		<PromptInput.Root onSubmit={handleSubmit}>
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
</div>
