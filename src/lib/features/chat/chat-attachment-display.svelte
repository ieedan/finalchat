<script lang="ts">
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { cn } from '$lib/utils';
	import { fallbackAttachmentDisplayName, isImageAttachmentMediaType } from '$lib/utils/chat-attachment-types';
	import { tv } from 'tailwind-variants';
	import ChatNonImageAttachmentRow from './chat-non-image-attachment-row.svelte';

	const variants = tv({
		base: 'rounded-xl overflow-hidden max-w-md w-full relative',
		variants: {
			size: {
				sm: 'max-w-sm',
				lg: 'max-w-md'
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
	const displayFileName = $derived(
		attachment.fileName ?? fallbackAttachmentDisplayName(attachment.mediaType)
	);
</script>

<a
	href={attachment.url}
	target="_blank"
	rel="noopener noreferrer"
	class={cn(
		variants({ size }),
		className,
		isImage && 'border border-border bg-card',
		'block cursor-pointer rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
	)}
	aria-label="Open attachment"
>
	{#if isImage}
		<!-- svelte-ignore a11y_missing_attribute -->
		<img src={attachment.url} class="object-cover" alt="" data-key={attachment.key} />
	{:else}
		<ChatNonImageAttachmentRow
			fileName={displayFileName}
			mediaType={attachment.mediaType}
			class="shadow-none"
		/>
	{/if}
</a>
