<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ChatSidebar from '$lib/features/chat/chat-sidebar.svelte';
	import { setupChat } from '$lib/features/chat/chat.svelte';
	import OnboardingDialog from '$lib/features/onboarding/onboarding-dialog.svelte';

	let { children, data } = $props();

	const chatState = setupChat({ user: data.user, userSettings: data.userSettings });
</script>

<Sidebar.Provider>
	<ChatSidebar />
	<Sidebar.Inset>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<OnboardingDialog
	userSettings={chatState.userSettingsQuery.data}
/>
