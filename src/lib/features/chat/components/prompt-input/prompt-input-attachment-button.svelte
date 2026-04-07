<script lang="ts">
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import { usePromptInputAttachmentButton } from './prompt-input.svelte.js';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { RiAttachment2 as AttachmentIcon } from 'remixicon-svelte';

	usePromptInputAttachmentButton();
</script>

<FileDropZone.Trigger
	class={buttonVariants({ variant: 'input', size: 'icon' })}
	title="Attach images, PDFs, or text files"
	aria-label="Attach images, PDFs, or text files"
>
	<AttachmentIcon class="size-4" />
</FileDropZone.Trigger>
