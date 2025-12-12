<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { AccessTokenCtx } from '$lib/context.svelte.js';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { env } from '$lib/env.client';
	import { cn } from '$lib/utils';
	import { getImageFileExtension } from '$lib/utils/media-types';
	import { DownloadIcon, EyeIcon } from '@lucide/svelte';
	import { tv } from 'tailwind-variants';

	const imageAttachmentVariants = tv({
		base: 'rounded-md overflow-hidden max-w-sm relative',
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

	const accessToken = AccessTokenCtx.get();

	async function downloadImage(filename: string) {
		const response = await fetch(
			new URL('/download-image', env.PUBLIC_CONVEX_SITE_URL).toString(),
			{
				method: 'POST',
				body: JSON.stringify({ key: attachment.key }),
				headers: { Authorization: `Bearer ${accessToken?.current}` }
			}
		);
		const blob = await response.blob();

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();

		URL.revokeObjectURL(link.href);
	}
</script>

<div class={cn(imageAttachmentVariants({ size }), className)}>
	<div class="absolute right-2 top-2">
		<Button
			onclick={() =>
				downloadImage(
					`generated-image${getImageFileExtension(attachment.mediaType ?? 'image/png') ?? '.png'}`
				)}
			size="icon"
			variant="outline"
			class="cursor-pointer"
		>
			<DownloadIcon class="size-4" />
		</Button>
	</div>
	<div class="absolute left-2 top-2">
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
