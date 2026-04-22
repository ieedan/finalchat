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

	// Flip `unread` off as soon as we see that the chat we're viewing has it
	// set. Fires on initial mount and whenever a new assistant message arrives
	// while we're still on the page (the mutation reactively updates the query).
	// The mutation is a no-op when already read.
	$effect(() => {
		const chat = chatViewState.chat;
		if (!chat) return;
		if (chat.unread !== true) return;
		void convex.mutation(api.chats.markRead, { chatId: chat._id });
	});
</script>

{@render children()}
