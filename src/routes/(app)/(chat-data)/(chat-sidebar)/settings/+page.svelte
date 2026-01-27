<script lang="ts">
	import SettingsApiKeyCard from '$lib/features/settings/components/settings-api-key-card.svelte';
	import SettingsKeyboardShortcutsCard from '$lib/features/settings/components/settings-keyboard-shortcuts-card.svelte';
	import SettingsBugsCard from '$lib/features/settings/components/settings-bugs-card.svelte';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import SettingsUserCard from '$lib/features/settings/components/settings-user-card.svelte';
	import SettingsSearchInput from '$lib/features/settings/components/settings-search-input.svelte';
	import SettingsSystemPromptCard from '$lib/features/settings/components/settings-system-prompt-card.svelte';
	import SettingsModeCard from '$lib/features/settings/components/settings-mode-card.svelte';
	import SettingsSubmitBehaviorCard from '$lib/features/settings/components/settings-submit-behavior-card.svelte';
	import SettingsFontCard from '$lib/features/settings/components/settings-font-card.svelte';
	import SettingsEmpty from '$lib/features/settings/components/settings-empty.svelte';

	const chatLayoutState = useChatLayout();
</script>

<SettingsSearchInput />
<SettingsUserCard />
<SettingsEmpty />
<SettingsKeyboardShortcutsCard class="md:flex hidden" />
<SettingsApiKeyCard />
<SettingsSystemPromptCard />
<SettingsModeCard />
<SettingsSubmitBehaviorCard />
<SettingsFontCard />
<SettingsBugsCard />
