<script lang="ts">
	import AttachmentDownload from '$lib/features/chat/attachment-download.svelte';

	let { attachmentKey, mediaType }: { attachmentKey: string; mediaType: string } = $props();
</script>

<div class="flex justify-end">
	<AttachmentDownload {attachmentKey} {mediaType} />
</div>
