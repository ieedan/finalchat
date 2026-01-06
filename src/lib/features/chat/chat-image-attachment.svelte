<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { cn } from '$lib/utils';
	import { EyeIcon } from '@lucide/svelte';
	import { tv } from 'tailwind-variants';
	import AttachmentDownload from './attachment-download.svelte';

	const imageAttachmentVariants = tv({
		base: 'rounded-md overflow-hidden max-w-sm relative border border-border group/image',
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

<div class={cn(imageAttachmentVariants({ size }), className)}>
	<div
		class="absolute right-2 top-2 md:opacity-0 group-hover/image:opacity-100 transition-opacity duration-200"
	>
		<AttachmentDownload
			attachmentKey={attachment.key}
			mediaType={attachment.mediaType ?? 'image/png'}
			filename="generated-image"
			size="icon"
			variant="outline"
		/>
	</div>
	<div
		class="absolute left-2 top-2 md:opacity-0 group-hover/image:opacity-100 transition-opacity duration-200"
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
	<!-- svelte-ignore a11y_missing_attribute -->
	<img src={attachment.url} class="object-cover" data-key={attachment.key} />
</div>
