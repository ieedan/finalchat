<script lang="ts">
	import SettingsModeCard from '$lib/features/settings/settings-mode-card.svelte';
	import SettingsApiKeyCard from '$lib/features/settings/settings-api-key-card.svelte';
</script>

<div class="w-full flex flex-col items-center">
	<div class="w-full max-w-3xl py-4 flex flex-col gap-4">
		<SettingsModeCard />
        <SettingsApiKeyCard />
	</div>
</div>
