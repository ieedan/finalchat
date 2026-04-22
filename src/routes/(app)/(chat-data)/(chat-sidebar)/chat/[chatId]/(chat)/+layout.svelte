<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { useConvexClient } from 'convex-svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { api } from '$lib/convex/_generated/api';
	import { setupChatView } from '$lib/features/chat/chat.svelte';

	let { children } = $props();

	// svelte-ignore state_referenced_locally
	setupChatView({ chatId: page.params.chatId as Id<'chats'> });
	const convex = useConvexClient();

	// Clear the chat's unread flag on every arrival — initial load, back/forward,
	// or sidebar navigation between chats. The mutation is server-checked and
	// no-ops when the chat isn't unread, so firing unconditionally is cheap.
	// The `!isActive` gate in the sidebar ensures the dot never appears while
	// you're actively viewing the chat, so "sat and watched the AI respond"
	// stays visually clean even though unread=true is set server-side.
	afterNavigate(() => {
		const id = page.params.chatId as Id<'chats'> | undefined;
		if (!id) return;
		void convex.mutation(api.chats.markRead, { chatId: id });
	});
</script>

{@render children()}
