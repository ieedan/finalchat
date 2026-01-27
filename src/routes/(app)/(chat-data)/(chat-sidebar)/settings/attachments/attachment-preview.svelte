<script lang="ts">
	import FileIcon from 'remixicon-svelte/icons/file-line';

	let { url, mediaType }: { url: string; mediaType: string } = $props();

	const isImage = $derived(mediaType.startsWith('image/'));
</script>

<a href={url} target="_blank" rel="noopener noreferrer" class="block">
	{#if isImage}
		<img
			src={url}
			alt="Attachment preview"
			class="border-border size-10 rounded border object-cover transition-opacity hover:opacity-80"
		/>
	{:else}
		<div
			class="border-border bg-muted text-muted-foreground flex size-10 items-center justify-center rounded border text-xs transition-opacity hover:opacity-80"
		>
			<FileIcon class="size-5" />
		</div>
	{/if}
</a>
