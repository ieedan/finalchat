<script>
	import { goto } from '$app/navigation';
	import PromptInputPlusItem from './prompt-input-plus-item.svelte';
	import { MessageSquarePlusIcon } from '@lucide/svelte';
</script>

<PromptInputPlusItem onSelect={() => goto('/chat')}>
	<MessageSquarePlusIcon class="size-4" />
	New Chat
</PromptInputPlusItem>
