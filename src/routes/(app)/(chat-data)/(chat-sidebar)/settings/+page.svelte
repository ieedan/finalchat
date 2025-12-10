<script lang="ts">
	import SettingsModeCard from '$lib/features/settings/settings-mode-card.svelte';
	import SettingsApiKeyCard from '$lib/features/settings/settings-api-key-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { useSidebar } from '$lib/components/ui/sidebar';

    const sidebar = useSidebar();
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<header class="sticky top-0">
	<div class="px-3 py-2.5 w-full flex items-center justify-between z-20">
		<div class="flex items-center gap-2">
			{#if sidebar.isMobile || !sidebar.open}
				<div class="size-9"></div>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<Button href="/auth/logout" variant="outline">Logout</Button>
		</div>
	</div>
	<div class="absolute w-full h-[24px] bg-background mask-b-from-0% -bottom-[14px] z-19"></div>
</header>
<div class="w-full flex flex-col items-center px-4">
	<div class="w-full max-w-3xl py-4 flex flex-col gap-4">
		<SettingsModeCard />
		<SettingsApiKeyCard />
	</div>
</div>
