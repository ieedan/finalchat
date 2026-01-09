<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import SettingsApiKeyCard from '$lib/features/settings/settings-api-key-card.svelte';
	import SettingsKeyboardShortcutsCard from '$lib/features/settings/settings-keyboard-shortcuts-card.svelte';
	import SettingsBugsCard from '$lib/features/settings/settings-bugs-card.svelte';
</script>

<AccountSettings.Page>
	<SettingsBugsCard />
	<SettingsKeyboardShortcutsCard />
	<SettingsApiKeyCard />
</AccountSettings.Page>
