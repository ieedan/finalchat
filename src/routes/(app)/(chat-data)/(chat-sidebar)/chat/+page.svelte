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
	import * as PromptInputMobile from '$lib/features/chat/components/prompt-input-mobile';
	import { cn } from '$lib/utils.js';
	import { BASIC_MODELS } from '$lib/ai';

	let { data } = $props();

	const chatLayoutState = useChatLayout();

	const modelId = ModelIdCtx.get();

	const chatAttachmentUploader = new ChatAttachmentUploader();

	// svelte-ignore state_referenced_locally
	let query = $state<string>(data.query ?? '');

	const attachmentsList = new PersistedState<{ url: string; key: string; mediaType: string }[]>(
		'new-chat-attachments',
		[]
	);

	const submitOnEnter = $derived(chatLayoutState.userSettingsQuery.data?.submitOnEnter ?? false);

	const shortcuts = $derived([
		{ name: 'New Chat', keys: [cmdOrCtrl, '⇧', 'O'], icon: MessageSquarePlusIcon },
		{ name: 'Model Picker', keys: [cmdOrCtrl, '⇧', 'M'], icon: MousePointerClickIcon },
		{ name: 'Go to Chat', keys: [cmdOrCtrl, 'G'], icon: ArrowRightIcon },
		{ name: 'Sidebar', keys: [cmdOrCtrl, 'B'], icon: PanelLeftIcon },
		{ name: 'Submit', keys: submitOnEnter ? ['Enter'] : [cmdOrCtrl, 'Enter'], icon: SendIcon }
	]);

	const mobileModels = $derived(
		chatLayoutState.userSettingsQuery.data?.onboarding?.mode === 'advanced'
			? chatLayoutState.models.filter((model) =>
					chatLayoutState.userSettingsQuery.data?.favoriteModelIds?.includes(model.id)
				)
			: BASIC_MODELS
	);
</script>

<div class="w-full h-full flex flex-col px-4 md:items-center md:justify-center md:gap-12">
	<div
		class={cn(
			'flex flex-col gap-8 flex-1 justify-center items-center',
			// mobile
			'fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2',
			// desktop
			'md:flex-none md:static md:translate-0'
		)}
	>
		<div class="flex w-full items-center flex-col justify-center">
			<FinalChat class="size-20" />
		</div>
		{#if chatLayoutState.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
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
		{/if}
	</div>
	<div class="flex flex-col gap-4 w-full items-center pb-2 sm:pb-4 md:pb-0 mt-auto md:mt-0">
		<!-- Mobile Prompt Input -->
		<PromptInputMobile.Root
			bind:modelId={modelId.current}
			onSubmit={chatLayoutState.handleSubmit}
			{submitOnEnter}
			class="w-full max-w-2xl md:hidden"
			optimisticClear={false}
			onUpload={chatAttachmentUploader.uploadMany}
			onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
			bind:attachments={attachmentsList.current}
			bind:value={query}
		>
			<PromptInputMobile.Plus>
				<PromptInputMobile.ModelPicker models={mobileModels} />
				<PromptInputMobile.PlusSeparator />
				<PromptInputMobile.AddAttachment />
			</PromptInputMobile.Plus>

			<PromptInputMobile.BannerWrapper>
				<PromptInputMobile.Banner dismissedByError dismissed={chatLayoutState.user !== null}>
					<PromptInputMobile.BannerContent>
						<p>
							<a href="/auth/login" class="font-medium underline">Sign in</a> to start chatting!
						</p>
					</PromptInputMobile.BannerContent>
				</PromptInputMobile.Banner>
				<PromptInputMobile.InputWrapper>
					<PromptInputMobile.AttachmentList />
					<PromptInputMobile.Input placeholder="Ask me anything..." />
				</PromptInputMobile.InputWrapper>
			</PromptInputMobile.BannerWrapper>

			<PromptInputMobile.Submit disabled={chatLayoutState.user === null} />
		</PromptInputMobile.Root>

		<!-- Desktop Prompt Input -->
		<PromptInput.Root
			bind:modelId={modelId.current}
			onSubmit={chatLayoutState.handleSubmit}
			{submitOnEnter}
			class="w-full max-w-2xl hidden md:block"
			optimisticClear={false}
			onUpload={chatAttachmentUploader.uploadMany}
			onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
			bind:attachments={attachmentsList.current}
			bind:value={query}
		>
			<PromptInput.Banner dismissedByError dismissed={chatLayoutState.user !== null}>
				<PromptInput.BannerContent>
					<p>
						<a href="/auth/login" class="font-medium underline">Sign in</a> to start chatting!
					</p>
				</PromptInput.BannerContent>
			</PromptInput.Banner>
			<PromptInput.Content>
				<PromptInput.AttachmentList />
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
					<PromptInput.Submit disabled={chatLayoutState.user === null} />
				</PromptInput.Footer>
			</PromptInput.Content>
		</PromptInput.Root>
	</div>
</div>
