<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
	import * as PromptInput from '$lib/features/chat/components/prompt-input';
	import ModelPickerBasic from '$lib/features/models/components/models-picker-basic.svelte';
	import ModelPickerAdvanced from '$lib/features/models/components/models-picker-advanced.svelte';
	import ReasoningEffortPicker from './components/reasoning-effort-picker.svelte';
	import { Button } from '$lib/components/ui/button';
	import { RiAlertLine as AlertIcon } from 'remixicon-svelte';
	import { useChatLayout } from './chat.svelte.js';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import type { ModelId } from './types.js';
	import type { ReasoningEffort } from '$lib/convex/schema.js';
	import type { ChatPromptAttachment } from './components/prompt-input/prompt-input.svelte.js';
	import { ChatAttachmentUploader } from './chat-attachment-uploader.svelte.js';
	import { supportsImages } from '$lib/features/models/openrouter';

	type Props = {
		messageId: Id<'messages'>;
		initialContent: string;
		initialAttachments: ChatPromptAttachment[];
		initialModelId: ModelId | null;
		initialReasoningEffort: ReasoningEffort;
		onDone: () => void;
	};

	let {
		messageId,
		initialContent,
		initialAttachments,
		initialModelId,
		initialReasoningEffort,
		onDone
	}: Props = $props();

	const chatLayoutState = useChatLayout();

	let value = $state(initialContent);
	let modelId = $state<ModelId | null>(initialModelId);
	let reasoningEffort = $state<ReasoningEffort>(initialReasoningEffort);
	let attachments = $state<ChatPromptAttachment[]>([...initialAttachments]);

	const uploader = new ChatAttachmentUploader();

	const submitOnEnter = $derived(chatLayoutState.userSettingsQuery.data?.submitOnEnter ?? false);

	const modelSupportsReasoning = $derived(chatLayoutState.modelSupportsReasoning(modelId));

	const selectedModel = $derived(chatLayoutState.models.find((m) => m.id === modelId));
	const showImageUnsupportedBanner = $derived.by(() => {
		const model = selectedModel;
		return attachments.length > 0 && model ? !supportsImages(model) : false;
	});

	async function handleSubmit(opts: {
		input: string;
		modelId: ModelId;
		attachments: ChatPromptAttachment[];
		reasoningEffort: ReasoningEffort;
	}) {
		await chatLayoutState.handleEdit(messageId, opts);
		onDone();
	}
</script>

<PromptInput.Root
	bind:value
	bind:modelId
	bind:reasoningEffort
	bind:attachments
	{submitOnEnter}
	optimisticClear={false}
	onSubmit={handleSubmit}
	onUpload={uploader.uploadMany}
	onDeleteAttachment={uploader.deleteAttachment}
	class="group/prompt-input w-full"
>
	<PromptInput.Banner dismissedByError={false} dismissed={!showImageUnsupportedBanner}>
		<PromptInput.BannerContent>
			<div class="flex items-center gap-2">
				<AlertIcon class="size-4 text-destructive shrink-0" />
				<p class="text-sm text-destructive">
					This model doesn't support images. Remove attachments or switch models to avoid errors.
				</p>
			</div>
		</PromptInput.BannerContent>
	</PromptInput.Banner>
	<PromptInput.Content>
		<PromptInput.AttachmentList />
		<PromptInput.Textarea placeholder="Edit your message..." />
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
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" onclick={onDone}>Cancel</Button>
				<PromptInput.Submit />
			</div>
		</PromptInput.Footer>
	</PromptInput.Content>
</PromptInput.Root>
