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
	import { FinalChat } from '$lib/components/logos';
	import {
		ArrowRightIcon,
		MessageSquarePlusIcon,
		MousePointerClickIcon,
		PanelLeftIcon,
		SendIcon
	} from '@lucide/svelte';

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

	const submitOnEnter = $derived(chatState.userSettingsQuery.data?.submitOnEnter ?? false);

	const shortcuts = $derived([
		{ name: 'New Chat', keys: [cmdOrCtrl, '⇧', 'O'], icon: MessageSquarePlusIcon },
		{ name: 'Model Picker', keys: [cmdOrCtrl, '⇧', 'M'], icon: MousePointerClickIcon },
		{ name: 'Go to Chat', keys: [cmdOrCtrl, 'G'], icon: ArrowRightIcon },
		{ name: 'Sidebar', keys: [cmdOrCtrl, 'B'], icon: PanelLeftIcon },
		{ name: 'Submit', keys: submitOnEnter ? ['Enter'] : [cmdOrCtrl, 'Enter'], icon: SendIcon }
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

<div class="w-full h-full flex-col items-center justify-center flex px-4 gap-12">
	<div class="flex flex-col gap-8">
		<div class="flex w-full items-center flex-col h-full justify-center md:h-auto">
			<FinalChat class="size-20" />
		</div>
		{#if chatState.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
			<div class="md:flex flex-col gap-0 w-full max-w-sm hidden">
				{#each shortcuts as shortcut (shortcut.name)}
					<div class="flex items-center justify-between gap-8 px-3 py-2.5 rounded-lg group">
						<div class="flex items-center gap-3">
							<div class="flex items-center justify-center size-5 rounded-xs bg-muted/50">
								<shortcut.icon class="size-4 text-primary" />
							</div>
							<span class="text-sm font-medium text-muted-foreground">
								{shortcut.name}
							</span>
						</div>
						<Kbd.Group class="gap-1">
							{#each shortcut.keys as key (key)}
								<Kbd.Root class="rounded-xs">
									{key}
								</Kbd.Root>
							{/each}
						</Kbd.Group>
					</div>
				{/each}
			</div>
		{:else}
			<h1 class="text-3xl font-bold">
				{greeting()}{chatState.user ? `, ${chatState.user.firstName}` : ''}!
			</h1>
		{/if}
	</div>
	<div class="flex flex-col gap-4 w-full items-center pb-4">
		<PromptInput.Root
			bind:modelId={modelId.current}
			onSubmit={chatState.handleSubmit}
			{submitOnEnter}
			class="w-full max-w-2xl"
			optimisticClear={false}
			onUpload={chatAttachmentUploader.uploadMany}
			onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
			bind:attachments={attachmentsList.current}
			bind:value={query}
		>
			<PromptInput.Banner dismissedByError dismissed={chatState.user !== null}>
				<PromptInput.BannerContent>
					<p><a href="/auth/login" class="font-medium underline">Sign in</a> to start chatting!</p>
				</PromptInput.BannerContent>
			</PromptInput.Banner>
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
					<PromptInput.Submit disabled={chatState.user === null} />
				</PromptInput.Footer>
			</PromptInput.Content>
		</PromptInput.Root>
	</div>
</div>
