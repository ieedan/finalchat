<script lang="ts">
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import { usePromptInputAttachmentButton } from '../prompt-input/prompt-input.svelte.js';
	import { RiImageAddLine as ImagePlusIcon } from 'remixicon-svelte';
	import PromptInputPlusItem from './prompt-input-plus-item.svelte';

	usePromptInputAttachmentButton();
</script>

<FileDropZone.Trigger>
	<PromptInputPlusItem>
		<ImagePlusIcon class="size-4" />
		Add Image
	</PromptInputPlusItem>
</FileDropZone.Trigger>
