<script lang="ts">
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import { usePromptInputAttachmentButton } from '../prompt-input/prompt-input.svelte.js';
	import ImagePlusIcon from '@lucide/svelte/icons/image-plus';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	usePromptInputAttachmentButton();
</script>

<FileDropZone.Trigger>
	<DropdownMenu.Item>
		<ImagePlusIcon class="size-4" />
		Add Image
	</DropdownMenu.Item>
</FileDropZone.Trigger>
