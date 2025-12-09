<script lang="ts">
	import { setupChatLayout } from '$lib/features/chat/chat.svelte';

	let { children, data } = $props();

	// svelte-ignore state_referenced_locally
	setupChatLayout({
		user: data.user,
		userSettings: data.userSettings,
		chats: data.chats,
		apiKey: data.apiKey,
		models: data.models
	});
</script>

{@render children()}
