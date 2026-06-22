<script lang="ts">
	import { page } from '$app/state';
	import { useConvexClient } from 'convex-svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { api } from '$lib/convex/_generated/api';
	import { setupChatView } from '$lib/features/chat/chat.svelte';

	let { children } = $props();

	// svelte-ignore state_referenced_locally
	const chatViewState = setupChatView({ chatId: page.params.chatId as Id<'chats'> });

	const convex = useConvexClient();

	// Mark the chat as read while the user is viewing it. This reacts to the
	// chat's `unread` flag, so it covers both navigating into the chat and a
	// new response landing while we're already on it.
	$effect(() => {
		const id = page.params.chatId as Id<'chats'> | undefined;
		if (!id || chatViewState.chat?.unread !== true) return;
		convex.mutation(api.chats.markRead, { chatId: id });
	});
</script>

{@render children()}
