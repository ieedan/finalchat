<script lang="ts">
	import { setupChatView } from '$lib/features/chat/chat.svelte';

	let { data, children } = $props();

	// svelte-ignore state_referenced_locally
	setupChatView({ chat: data.chat });
</script>

<svelte:head>
	<title>{data.chat.title}</title>
</svelte:head>

{@render children()}
