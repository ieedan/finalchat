<script lang="ts">
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import { usePromptInputAttachmentButton } from '../prompt-input/prompt-input.svelte.js';
	import { RiAttachment2 as AttachmentIcon } from 'remixicon-svelte';
	import PromptInputPlusItem from './prompt-input-plus-item.svelte';

	usePromptInputAttachmentButton();
</script>

<FileDropZone.Trigger aria-label="Attach images, PDFs, or text files">
	<PromptInputPlusItem>
		<AttachmentIcon class="size-4" />
		Attach file
	</PromptInputPlusItem>
</FileDropZone.Trigger>
