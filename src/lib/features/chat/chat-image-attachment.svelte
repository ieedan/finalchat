<script lang="ts">
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { cn } from '$lib/utils';
	import { tv } from 'tailwind-variants';

	const imageAttachmentVariants = tv({
		base: 'rounded-md overflow-hidden max-w-sm relative border border-border',
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
</script>

<a
	href={attachment.url}
	target="_blank"
	rel="noopener noreferrer"
	class={cn(
		imageAttachmentVariants({ size }),
		className,
		'block cursor-pointer outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
	)}
	aria-label="Open image attachment"
>
	<!-- svelte-ignore a11y_missing_attribute -->
	<img src={attachment.url} class="object-cover" alt="" data-key={attachment.key} />
</a>
