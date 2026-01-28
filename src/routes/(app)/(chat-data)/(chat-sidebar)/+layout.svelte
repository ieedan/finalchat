<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ChatSidebar from '$lib/features/chat/chat-sidebar.svelte';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import OnboardingDialog from '$lib/features/onboarding/onboarding-dialog.svelte';
	import SearchModal from '$lib/features/search/components/search-modal.svelte';

	let { children } = $props();

	const chatLayoutState = useChatLayout();
</script>

<Sidebar.Provider>
	<ChatSidebar />
	<Sidebar.Inset class="h-dvh">
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<SearchModal />

<OnboardingDialog
	user={chatLayoutState.user}
	userSettings={chatLayoutState.userSettingsQuery.data}
/>
