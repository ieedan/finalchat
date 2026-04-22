<script lang="ts">
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { cn } from '$lib/utils';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		fallbackAttachmentDisplayName,
		isImageAttachmentMediaType
	} from '$lib/utils/chat-attachment-types';
	import { tv } from 'tailwind-variants';
	import ChatNonImageAttachment from './chat-non-image-attachment.svelte';

	const variants = tv({
		base: 'block rounded-xl overflow-hidden relative',
		variants: {
			size: {
				sm: '',
				lg: ''
			},
			image: {
				true: '',
				false: 'max-w-md w-full'
			}
		},
		compoundVariants: [
			{ image: true, size: 'sm', class: 'max-w-[16rem] max-h-64' },
			{ image: true, size: 'lg', class: 'max-w-sm max-h-80' }
		]
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
	const aspectRatio = $derived(
		isImage && attachment.width && attachment.height
			? `${attachment.width} / ${attachment.height}`
			: undefined
	);

	let loaded = $state(false);
</script>

<a
	href={attachment.url}
	target="_blank"
	rel="noopener noreferrer"
	class={cn(
		variants({ size, image: isImage }),
		className,
		isImage && 'border border-border bg-card',
		aspectRatio && 'w-full',
		'cursor-pointer rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
	)}
	style={aspectRatio ? `aspect-ratio: ${aspectRatio};` : undefined}
	aria-label="Open attachment"
>
	{#if isImage}
		{#if !loaded && aspectRatio}
			<Skeleton class="absolute inset-0 h-full w-full rounded-none" />
		{/if}
		<!-- svelte-ignore a11y_missing_attribute -->
		<img
			src={attachment.url}
			class={cn('object-cover', aspectRatio && 'h-full w-full', !loaded && 'opacity-0')}
			width={attachment.width}
			height={attachment.height}
			alt=""
			data-key={attachment.key}
			onload={() => (loaded = true)}
		/>
	{:else}
		<ChatNonImageAttachment
			fileName={displayFileName}
			mediaType={attachment.mediaType}
			class="shadow-none"
		/>
	{/if}
</a>
