<script>
	import { goto } from '$app/navigation';
	import PromptInputPlusItem from './prompt-input-plus-item.svelte';
	import MessageSquarePlusIcon from 'remixicon-svelte/icons/chat-new-line';
</script>

<PromptInputPlusItem onSelect={() => goto('/chat')}>
	<MessageSquarePlusIcon class="size-4" />
	New Chat
</PromptInputPlusItem>
