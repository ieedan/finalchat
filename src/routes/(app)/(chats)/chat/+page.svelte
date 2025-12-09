<script lang="ts">
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/models/components/models-picker-basic.svelte';
	import { ModelIdCtx } from '$lib/context.svelte';
	import { ChatAttachmentUploader } from '$lib/features/chat/chat-attachment-uploader.svelte.js';
	import { PersistedState } from 'runed';
	import ModelPickerAdvanced from '$lib/features/models/components/models-picker-advanced.svelte';

	const chatState = useChatLayout();

	const modelId = ModelIdCtx.get();

	const chatAttachmentUploader = new ChatAttachmentUploader();

	const attachmentsList = new PersistedState<{ url: string; key: string }[]>(
		'new-chat-attachments',
		[]
	);
</script>

<svelte:head>
	<title>New Chat</title>
</svelte:head>

<div class="w-full h-full items-center justify-center flex">
	<PromptInput.Root
		bind:modelId={modelId.current}
		onSubmit={chatState.handleSubmit}
		class="w-full max-w-2xl"
		onUpload={chatAttachmentUploader.uploadMany}
		onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
		bind:attachments={attachmentsList.current}
	>
		<PromptInput.Content>
			<PromptInput.AttachmentList />
			<PromptInput.Textarea placeholder="Ask me anything..." />
			<PromptInput.Footer class="justify-between">
				<div class="flex items-center gap-2">
					{#if chatState.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
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
