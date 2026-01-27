<script lang="ts">
	import { SettingsLayoutCtx } from '../settings.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import { RiSettings3Line as SettingsIcon } from 'remixicon-svelte';
	import { Button } from '$lib/components/ui/button';

	const SettingsLayoutState = SettingsLayoutCtx.get();
</script>

{#if SettingsLayoutState.sortedSettings.length === 0}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<SettingsIcon />
			</Empty.Media>
			<Empty.Title>No settings found</Empty.Title>
			<Empty.Description>
				We couldn't find any settings for your search. Try resetting your search.
			</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button variant="outline" onclick={() => SettingsLayoutState.updateSearchQuery?.('')}>
				Reset search
			</Button>
		</Empty.Content>
	</Empty.Root>
{/if}
