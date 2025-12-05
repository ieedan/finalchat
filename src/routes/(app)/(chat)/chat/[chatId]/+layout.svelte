<script lang="ts">
	import { setupChatView } from '$lib/features/chat/chat.svelte';

	let { data, children } = $props();

	// svelte-ignore state_referenced_locally
	setupChatView({ chat: data.chat });
</script>

{@render children()}
