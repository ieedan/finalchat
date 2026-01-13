<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import SettingsApiKeyCard from '$lib/features/settings/settings-api-key-card.svelte';
	import SettingsKeyboardShortcutsCard from '$lib/features/settings/settings-keyboard-shortcuts-card.svelte';
	import SettingsBugsCard from '$lib/features/settings/settings-bugs-card.svelte';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';

	const chatLayoutState = useChatLayout();
</script>

<AccountSettings.Page>
	<SettingsBugsCard />
	<SettingsKeyboardShortcutsCard />
	{#if !chatLayoutState.user?.membership}
		<SettingsApiKeyCard />
	{/if}
</AccountSettings.Page>
