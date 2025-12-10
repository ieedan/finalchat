<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import SettingsModeCard from '$lib/features/settings/settings-mode-card.svelte';
	import SettingsApiKeyCard from '$lib/features/settings/settings-api-key-card.svelte';
	import SettingsKeyboardShortcutsCard from '$lib/features/settings/settings-keyboard-shortcuts-card.svelte';
</script>

<svelte:head>
	<title>Account - Settings</title>
</svelte:head>

<AccountSettings.Page>
	<SettingsKeyboardShortcutsCard />
	<SettingsModeCard />
	<SettingsApiKeyCard />
</AccountSettings.Page>
