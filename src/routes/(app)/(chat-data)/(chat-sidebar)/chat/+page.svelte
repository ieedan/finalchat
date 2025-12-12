<script lang="ts">
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/models/components/models-picker-basic.svelte';
	import { ModelIdCtx } from '$lib/context.svelte';
	import { ChatAttachmentUploader } from '$lib/features/chat/chat-attachment-uploader.svelte.js';
	import { PersistedState } from 'runed';
	import ModelPickerAdvanced from '$lib/features/models/components/models-picker-advanced.svelte';
	import * as Kbd from '$lib/components/ui/kbd';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
	import { MetaTags } from '$lib/components/meta-tags';
	import { FinalChat } from '$lib/components/logos';

	let { data } = $props();

	const chatState = useChatLayout();

	const modelId = ModelIdCtx.get();

	const chatAttachmentUploader = new ChatAttachmentUploader();

	// svelte-ignore state_referenced_locally
	let query = $state<string>(data.query ?? '');

	const attachmentsList = new PersistedState<{ url: string; key: string; mediaType: string }[]>(
		'new-chat-attachments',
		[]
	);

	const shortcuts = $derived([
		{
			name: 'New Chat',
			keys: [cmdOrCtrl, '⇧', 'O']
		},
		{
			name: 'Model Picker',
			keys: [cmdOrCtrl, '⇧', 'M']
		},
		{
			name: 'Go to Chat',
			keys: [cmdOrCtrl, 'G']
		},
		{
			name: 'Sidebar',
			keys: [cmdOrCtrl, 'B']
		},
		{
			name: 'Submit',
			keys: [cmdOrCtrl, 'Enter']
		}
	]);

	const greeting = $derived(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) {
			return 'Good morning';
		} else if (hour >= 12 && hour < 18) {
			return 'Good afternoon';
		} else {
			return 'Good evening';
		}
	});
</script>

<MetaTags title="New Chat" />

<div class="w-full h-full flex-col items-center justify-center flex px-4 gap-8">
	<div class="flex w-full items-center flex-col">
		<FinalChat class="size-20" />
	</div>
	{#if chatState.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
		<div class="flex flex-col gap-2 w-full max-w-sm">
			{#each shortcuts as shortcut (shortcut.name)}
				<div class="flex items-center justify-between gap-8">
					<span class="text-muted-foreground">{shortcut.name}</span>
					<Kbd.Group class="gap-1">
						{#each shortcut.keys as key (key)}
							<Kbd.Root>{key}</Kbd.Root>
						{/each}
					</Kbd.Group>
				</div>
			{/each}
		</div>
	{:else}
		<h1 class="text-3xl font-bold">{greeting()}, {chatState.user.firstName}!</h1>
	{/if}
	<div class="flex flex-col gap-4 w-full items-center">
		<PromptInput.Root
			bind:modelId={modelId.current}
			onSubmit={chatState.handleSubmit}
			class="w-full max-w-2xl"
			onUpload={chatAttachmentUploader.uploadMany}
			onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
			bind:attachments={attachmentsList.current}
			bind:value={query}
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
</div>
