<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInput, type OnSubmit } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import { RiAlertLine as AlertIcon } from 'remixicon-svelte';
	import PromptInputBannerContent from './prompt-input-banner-content.svelte';
	import PromptInputBanner from './prompt-input-banner.svelte';
	import PromptInputBannerDismiss from './prompt-input-banner-dismiss.svelte';
	import type { ModelId } from '../../types.js';
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';

	let {
		class: className,
		children,
		onSubmit,
		submitOnEnter = false,
		optimisticClear = true,
		value = $bindable(''),
		modelId = $bindable(null),
		generating = false,
		onUpload,
		onDeleteAttachment,
		attachments = $bindable([]),
		...rest
	}: HTMLAttributes<HTMLDivElement> & {
		onSubmit: OnSubmit;
		onUpload: (files: File[]) => Promise<{ url: string; key: string; mediaType: string }[]>;
		onDeleteAttachment: (key: string) => Promise<void>;
		generating?: boolean;
		/**
		 * Whether to submit the form on enter. Otherwise the form will be submitted on Ctrl/Cmd+Enter.
		 */
		submitOnEnter?: boolean;
		optimisticClear?: boolean;
		value?: string;
		modelId?: ModelId | null;
		attachments?: { url: string; key: string; mediaType: string }[];
	} = $props();

	const promptInputState = usePromptInput({
		onSubmit: box.with(() => onSubmit),
		onUpload: box.with(() => onUpload),
		onDeleteAttachment: box.with(() => onDeleteAttachment),
		submitOnEnter: box.with(() => submitOnEnter),
		generating: box.with(() => generating),
		value: box.with(
			() => value,
			(v) => (value = v)
		),
		attachments: box.with(
			() => attachments,
			(v) => (attachments = v)
		),
		optimisticClear: box.with(() => optimisticClear),
		modelId: box.with(
			() => modelId,
			(v) => (modelId = v)
		)
	});

	const fileCount = $derived(promptInputState.uploadingAttachments.size + attachments.length);
	const maxFiles = 3;
</script>

<FileDropZone.Root
	onUpload={promptInputState.onUpload}
	accept={FileDropZone.ACCEPT_IMAGE}
	{maxFiles}
	{fileCount}
	onFileRejected={(opts) => {
		promptInputState.error = `${opts.file.name} not uploaded: ${opts.reason}`;
	}}
>
	<div class={cn('relative', className)} {...rest}>
		<PromptInputBanner
			dismissed={promptInputState.error === null}
			dismissedByError={false}
			onDismiss={() => (promptInputState.error = null)}
		>
			<PromptInputBannerContent>
				<div class="flex items-center gap-1.5 relative min-w-0">
					<AlertIcon class="size-4 text-destructive shrink-0" />
					<span class="text-sm text-destructive truncate min-w-0">{promptInputState.error}</span>
				</div>
				<PromptInputBannerDismiss />
			</PromptInputBannerContent>
		</PromptInputBanner>
		{@render children?.()}
	</div>
</FileDropZone.Root>
