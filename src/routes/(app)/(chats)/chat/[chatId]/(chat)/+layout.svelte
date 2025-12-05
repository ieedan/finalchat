<script lang="ts">
	import { page } from '$app/state';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { setupChatView } from '$lib/features/chat/chat.svelte';

	let { children } = $props();

	// svelte-ignore state_referenced_locally
	setupChatView({ chatId: page.params.chatId as Id<'chat'> });
</script>

{@render children()}
