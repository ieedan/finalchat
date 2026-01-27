<script>
	import { goto } from '$app/navigation';
	import PromptInputPlusItem from './prompt-input-plus-item.svelte';
	import { RiChatNewLine as MessageSquarePlusIcon } from 'remixicon-svelte';
</script>

<PromptInputPlusItem onSelect={() => goto('/chat')}>
	<MessageSquarePlusIcon class="size-4" />
	New Chat
</PromptInputPlusItem>
