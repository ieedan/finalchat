<script lang="ts">
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import { usePromptInputAttachmentButton } from './prompt-input.svelte.js';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';

	const attachmentButtonState = usePromptInputAttachmentButton();
</script>

<FileDropZone.Root onUpload={attachmentButtonState.rootState.onUpload}>
	<FileDropZone.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
		<PaperclipIcon class="size-4" />
	</FileDropZone.Trigger>
</FileDropZone.Root>
