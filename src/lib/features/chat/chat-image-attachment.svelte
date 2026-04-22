<script lang="ts">
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { cn } from '$lib/utils';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { tv } from 'tailwind-variants';

	const imageAttachmentVariants = tv({
		base: 'block rounded-md overflow-hidden relative border border-border',
		variants: {
			size: {
				sm: 'max-w-[18rem] max-h-72',
				lg: 'max-w-sm max-h-96'
			}
		}
	});

	type Props = {
		attachment: Doc<'chatAttachments'> & { url: string };
		size: 'sm' | 'lg';
		className?: string;
	};

	let { attachment, size = 'sm', className }: Props = $props();

	let loaded = $state(false);

	const aspectRatio = $derived(
		attachment.width && attachment.height ? `${attachment.width} / ${attachment.height}` : undefined
	);
</script>

<a
	href={attachment.url}
	target="_blank"
	rel="noopener noreferrer"
	class={cn(
		imageAttachmentVariants({ size }),
		className,
		aspectRatio && 'w-full',
		'cursor-pointer outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
	)}
	style={aspectRatio ? `aspect-ratio: ${aspectRatio};` : undefined}
	aria-label="Open image attachment"
>
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
</a>
