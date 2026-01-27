<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		RiHistoryLine as HistoryIcon,
		RiArrowRightLine as ArrowRightIcon
	} from 'remixicon-svelte';
	import { cn } from '$lib/utils';
	import { useSettingsSetting, type Setting } from '../settings.svelte';

	const meta: Setting = {
		id: 'history',
		title: 'History',
		description: 'Manage your chat history.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<Item.Root variant="outline" class="bg-card w-full relative group" style={settingState.style}>
	<Item.Content>
		<a href="/settings/history">
			<Item.Title class="flex items-center gap-2">
				<HistoryIcon class="size-4" />
				History
				<span class="absolute inset-0 z-10"></span>
			</Item.Title>
		</a>
		<Item.Description>Manage your chat history.</Item.Description>
	</Item.Content>
	<Item.Actions>
		<div class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'group-hover:bg-accent/50')}>
			<ArrowRightIcon class="size-4" />
		</div>
	</Item.Actions>
</Item.Root>
