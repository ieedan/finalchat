<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { Button } from '$lib/components/ui/button';
	import { Github } from '$lib/components/logos';
	import { ExternalLink } from '@lucide/svelte';
	import { useSettingsSetting, type Setting } from '../settings.svelte';
	import { cn } from '$lib/utils';

	const meta: Setting = {
		id: 'bugs',
		title: 'Bugs',
		description: 'Report any bugs by creating an issue on GitHub.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<Item.Root variant="outline" class={cn('bg-card w-full')} style={settingState.style}>
	<Item.Content>
		<Item.Title>{meta.title}</Item.Title>
		<Item.Description
			>Report any bugs by creating an issue on
			<span class="md:inline hidden"> GitHub. </span>
			<a
				href="https://github.com/ieedan/finalchat/issues"
				target="_blank"
				rel="noopener noreferrer"
				class="md:hidden inline"
			>
				GitHub
				<ExternalLink class="size-3 inline align-baseline" />
			</a>
		</Item.Description>
	</Item.Content>
	<Item.Actions class="md:flex hidden">
		<Button
			href="https://github.com/ieedan/finalchat/issues"
			variant="outline"
			target="_blank"
			rel="noopener noreferrer"
		>
			<Github />
			ieedan/finalchat
		</Button>
	</Item.Actions>
</Item.Root>
