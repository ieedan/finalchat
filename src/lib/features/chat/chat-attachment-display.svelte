<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { cn } from '$lib/utils';
	import {
		attachmentTypeLabel,
		isImageAttachmentMediaType
	} from '$lib/utils/chat-attachment-types';
	import { getAttachmentFileExtension } from '$lib/utils/media-types';
	import { RiEyeLine as EyeIcon, RiFileLine as FileIcon } from 'remixicon-svelte';
	import { tv } from 'tailwind-variants';
	import AttachmentDownload from './attachment-download.svelte';

	const variants = tv({
		base: 'rounded-md overflow-hidden max-w-sm relative border border-border group/attachment',
		variants: {
			size: {
				sm: 'max-w-2xs',
				lg: 'max-w-sm'
			}
		}
	});

	type Props = {
		attachment: Doc<'chatAttachments'> & { url: string };
		size: 'sm' | 'lg';
		className?: string;
	};

	let { attachment, size = 'sm', className }: Props = $props();

	const isImage = $derived(isImageAttachmentMediaType(attachment.mediaType));
	const downloadName = $derived(
		`attachment${getAttachmentFileExtension(attachment.mediaType) ?? '.file'}`
	);
</script>

<div class={cn(variants({ size }), className)}>
	<div
		class="absolute right-2 top-2 md:opacity-0 group-hover/attachment:opacity-100 transition-opacity duration-200"
	>
		<AttachmentDownload
			attachmentKey={attachment.key}
			mediaType={attachment.mediaType}
			filename={downloadName}
			size="icon"
			variant="outline"
		/>
	</div>
	<div
		class="absolute left-2 top-2 md:opacity-0 group-hover/attachment:opacity-100 transition-opacity duration-200"
	>
		<Button
			href={attachment.url}
			size="icon"
			variant="outline"
			class="cursor-pointer"
			target="_blank"
			rel="noopener noreferrer"
		>
			<EyeIcon class="size-4" />
		</Button>
	</div>
	{#if isImage}
		<!-- svelte-ignore a11y_missing_attribute -->
		<img src={attachment.url} class="object-cover" alt="" data-key={attachment.key} />
	{:else}
		<div
			class="bg-muted text-muted-foreground flex aspect-square max-h-48 flex-col items-center justify-center gap-1 p-3 text-center text-xs"
			data-key={attachment.key}
		>
			<FileIcon class="size-8 shrink-0 opacity-80" />
			<span class="font-medium leading-tight">{attachmentTypeLabel(attachment.mediaType)}</span>
		</div>
	{/if}
</div>
