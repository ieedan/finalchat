<script lang="ts">
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import { usePromptInputAttachmentButton } from './prompt-input.svelte.js';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { RiImageAddLine as ImagePlusIcon } from 'remixicon-svelte';

	usePromptInputAttachmentButton();
</script>

<FileDropZone.Trigger class={buttonVariants({ variant: 'input', size: 'icon' })}>
	<ImagePlusIcon class="size-4" />
</FileDropZone.Trigger>
