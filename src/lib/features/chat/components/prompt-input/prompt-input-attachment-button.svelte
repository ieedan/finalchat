<script lang="ts">
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import { usePromptInputAttachmentButton } from './prompt-input.svelte.js';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import ImagePlusIcon from '@lucide/svelte/icons/image-plus';

	const attachmentButtonState = usePromptInputAttachmentButton();
</script>

<FileDropZone.Root
	onUpload={attachmentButtonState.rootState.onUpload}
	accept={FileDropZone.ACCEPT_IMAGE}
>
	<FileDropZone.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
		<ImagePlusIcon class="size-4" />
	</FileDropZone.Trigger>
</FileDropZone.Root>
