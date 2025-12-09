<script lang="ts">
	import { goto } from '$app/navigation';
	import { shortcut } from '$lib/actions/shortcut.svelte';
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

<svelte:window
	use:shortcut={{ key: 'o', shift: true, ctrl: true, callback: () => goto('/chat') }}
/>

{@render children()}
