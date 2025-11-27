<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ChatSidebar from '$lib/features/chat/chat-sidebar.svelte';
	import { ChatCtx, setupChat } from '$lib/features/chat/chat.svelte';

	let { children, data } = $props();

    setupChat({ user: data.user });
</script>

<Sidebar.Provider>
	<ChatSidebar/>
	<Sidebar.Inset>
        {@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
