<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { useConvexClient } from 'convex-svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { api } from '$lib/convex/_generated/api';
	import { setupChatView } from '$lib/features/chat/chat.svelte';

	let { children } = $props();

	// svelte-ignore state_referenced_locally
	const chatViewState = setupChatView({ chatId: page.params.chatId as Id<'chats'> });

	const convex = useConvexClient();

	// set unread to false once we navigate to the chat
	afterNavigate(() => {
		const id = page.params.chatId as Id<'chats'> | undefined;
		if (!id || chatViewState.chat?.unread === false) return;
		convex.mutation(api.chats.markRead, { chatId: id });
	});
</script>

{@render children()}
