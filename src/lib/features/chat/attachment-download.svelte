<script lang="ts">
	import { Button, type ButtonVariant, type ButtonSize } from '$lib/components/ui/button';
	import { AccessTokenCtx } from '$lib/context.svelte';
	import { env } from '$lib/env.client';
	import { getImageFileExtension } from '$lib/utils/media-types';
	import DownloadIcon from '@lucide/svelte/icons/download';

	let {
		attachmentKey,
		mediaType,
		filename,
		variant = 'ghost',
		size = 'icon'
	}: {
		attachmentKey: string;
		mediaType: string;
		filename?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
	} = $props();

	const accessToken = AccessTokenCtx.get();

	const resolvedFilename = $derived(
		filename ?? `attachment${getImageFileExtension(mediaType) ?? '.file'}`
	);

	async function handleDownload() {
		const response = await fetch(
			new URL('/download-image', env.PUBLIC_CONVEX_SITE_URL).toString(),
			{
				method: 'POST',
				body: JSON.stringify({ key: attachmentKey }),
				headers: { Authorization: `Bearer ${accessToken?.current}` }
			}
		);
		const blob = await response.blob();

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = resolvedFilename;
		link.click();

		URL.revokeObjectURL(link.href);
	}
</script>

<Button {variant} {size} onclick={handleDownload} class="cursor-pointer">
	<DownloadIcon class="size-4" />
</Button>
