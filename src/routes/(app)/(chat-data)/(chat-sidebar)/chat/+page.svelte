<script lang="ts">
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import ModelPickerBasic from '$lib/features/models/components/models-picker-basic.svelte';
	import { ModelIdCtx, ReasoningEffortCtx } from '$lib/context.svelte';
	import { ChatAttachmentUploader } from '$lib/features/chat/chat-attachment-uploader.svelte.js';
	import { PersistedState } from 'runed';
	import ModelPickerAdvanced from '$lib/features/models/components/models-picker-advanced.svelte';
	import { FinalChat } from '$lib/components/logos';
	import { RiAlertLine as AlertIcon, RiGithubLine as GithubLogo } from 'remixicon-svelte';
	import * as PromptInputMobile from '$lib/features/chat/components/prompt-input-mobile';
	import { cn } from '$lib/utils.js';
	import { BASIC_MODELS } from '$lib/ai';
	import { Button } from '$lib/components/ui/button/index.js';
	import ReasoningEffortPicker from '$lib/features/chat/components/reasoning-effort-picker.svelte';
	import { supportsImages } from '$lib/features/models/openrouter';

	let { data } = $props();

	const chatLayoutState = useChatLayout();

	const modelId = ModelIdCtx.get();
	const reasoningEffort = ReasoningEffortCtx.get();

	const chatAttachmentUploader = new ChatAttachmentUploader();

	const userDismissedApiKeyBanner = new PersistedState<boolean>(
		'user-dismissed-api-key-banner',
		false
	);
	const apiKeyBannerDismissed = $derived(
		chatLayoutState.apiKey !== null || userDismissedApiKeyBanner.current
	);

	// svelte-ignore state_referenced_locally
	let query = $state<string>(data.query ?? '');

	const attachmentsList = new PersistedState<
		{ url: string; key: string; mediaType: string; fileName?: string }[]
	>('new-chat-attachments', []);

	const submitOnEnter = $derived(chatLayoutState.userSettingsQuery.data?.submitOnEnter ?? false);

	const mobileModels = $derived(
		chatLayoutState.isAdvancedMode
			? chatLayoutState.models.filter((model) =>
					chatLayoutState.favoriteModelIds?.includes(model.id)
				)
			: BASIC_MODELS
	);

	const modelSupportsReasoning = $derived(chatLayoutState.modelSupportsReasoning(modelId.current));
	const selectedModel = $derived(
		chatLayoutState.models.find((model) => model.id === modelId.current)
	);
	const showImageUnsupportedBanner = $derived.by(() => {
		const model = selectedModel;
		return attachmentsList.current.length > 0 && model ? !supportsImages(model) : false;
	});
</script>

<div class="relative h-full w-full min-h-0 flex flex-col px-4">
	<!-- Mobile logo (in flow + fixed centering); hidden on desktop — desktop uses absolute copy below -->
	<div
		class={cn(
			'flex flex-col gap-8 flex-1 justify-center items-center',
			'fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2',
			'md:hidden'
		)}
	>
		<div class="flex w-full items-center flex-col justify-center">
			<FinalChat class="size-20" />
		</div>
	</div>

	<!-- Desktop logo: above viewport center, does not affect composer centering -->
	<div
		class="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 translate-y-[calc(-50%-10.5rem)] md:block"
	>
		<div class="pointer-events-auto flex flex-col items-center justify-center">
			<FinalChat class="size-20" />
		</div>
	</div>

	<div class="mt-auto flex w-full flex-col items-center gap-4 pb-2 sm:pb-4 md:hidden">
		<!-- Mobile Prompt Input -->
		<PromptInputMobile.Root
			bind:modelId={modelId.current}
			bind:reasoningEffort={reasoningEffort.current}
			onSubmit={chatLayoutState.handleSubmit}
			{submitOnEnter}
			class="w-full max-w-2xl"
			optimisticClear={false}
			onUpload={chatAttachmentUploader.uploadMany}
			onDeleteAttachment={chatAttachmentUploader.deleteAttachment}
			bind:attachments={attachmentsList.current}
			bind:value={query}
		>
			<PromptInputMobile.Plus>
				<PromptInputMobile.NewChat />
				<PromptInputMobile.PlusSeparator />
				<PromptInputMobile.ModelPicker models={mobileModels} />
				{#if chatLayoutState.isAdvancedMode && modelSupportsReasoning}
					<PromptInputMobile.PlusSeparator />
					<PromptInputMobile.ReasoningEffortPicker />
				{/if}
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
				{#if chatLayoutState.user !== null}
					<PromptInputMobile.Banner
						dismissedByError
						dismissed={apiKeyBannerDismissed}
						onDismiss={() => (userDismissedApiKeyBanner.current = true)}
					>
						<PromptInputMobile.BannerContent>
							<p>
								<a href="/settings" class="font-medium underline">Setup API key</a>
							</p>
							<PromptInput.BannerDismiss />
						</PromptInputMobile.BannerContent>
					</PromptInputMobile.Banner>
				{/if}
				<PromptInputMobile.Banner dismissedByError={false} dismissed={!showImageUnsupportedBanner}>
					<PromptInputMobile.BannerContent>
						<div class="flex items-center gap-2">
							<AlertIcon class="size-4 text-destructive shrink-0" />
							<p class="text-sm text-destructive">
								This model doesn't support images. Remove attachments or switch models to avoid
								errors.
							</p>
						</div>
					</PromptInputMobile.BannerContent>
				</PromptInputMobile.Banner>
				<PromptInputMobile.InputWrapper>
					<PromptInputMobile.AttachmentList />
					<PromptInputMobile.Input placeholder="Ask me anything..." />
				</PromptInputMobile.InputWrapper>
			</PromptInputMobile.BannerWrapper>

			<PromptInputMobile.Submit disabled={chatLayoutState.user === null} />
		</PromptInputMobile.Root>
	</div>

	<!-- Desktop prompt: true viewport center (logo is positioned independently) -->
	<div class="absolute top-1/2 left-4 right-4 z-10 hidden -translate-y-1/2 md:block">
		<PromptInput.Root
			bind:modelId={modelId.current}
			bind:reasoningEffort={reasoningEffort.current}
			onSubmit={chatLayoutState.handleSubmit}
			{submitOnEnter}
			class="mx-auto w-full max-w-2xl"
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
			{#if chatLayoutState.user !== null}
				<PromptInput.Banner
					dismissedByError
					dismissed={apiKeyBannerDismissed}
					onDismiss={() => (userDismissedApiKeyBanner.current = true)}
				>
					<PromptInput.BannerContent>
						<p>
							You're currently limited to free models. <a
								href="/settings"
								class="font-medium underline">Setup API key</a
							>.
						</p>
						<PromptInputMobile.BannerDismiss />
					</PromptInput.BannerContent>
				</PromptInput.Banner>
			{/if}
			<PromptInput.Banner dismissedByError={false} dismissed={!showImageUnsupportedBanner}>
				<PromptInput.BannerContent>
					<div class="flex items-center gap-2">
						<AlertIcon class="size-4 text-destructive shrink-0" />
						<p class="text-sm text-destructive">
							This model doesn't support images. Remove attachments or switch models to avoid
							errors.
						</p>
					</div>
				</PromptInput.BannerContent>
			</PromptInput.Banner>
			<PromptInput.Content>
				<PromptInput.AttachmentList />
				<PromptInput.Textarea placeholder="Ask me anything..." />
				<PromptInput.Footer class="justify-between">
					<div class="flex items-center gap-2">
						{#if chatLayoutState.isAdvancedMode}
							<ModelPickerAdvanced />
						{:else}
							<ModelPickerBasic models={chatLayoutState.availableBasicModels} />
						{/if}
						<PromptInput.AttachmentButton />
						{#if chatLayoutState.isAdvancedMode && modelSupportsReasoning}
							<ReasoningEffortPicker />
						{/if}
					</div>
					<PromptInput.Submit disabled={chatLayoutState.user === null} />
				</PromptInput.Footer>
			</PromptInput.Content>
		</PromptInput.Root>
	</div>
</div>

<div class="hidden md:flex fixed bottom-2 right-2">
	<Button
		href="https://github.com/ieedan/finalchat"
		target="_blank"
		rel="noopener noreferrer"
		variant="ghost"
		size="icon"
	>
		<GithubLogo />
	</Button>
</div>
