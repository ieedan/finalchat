<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		RiHistoryLine as HistoryIcon,
		RiAttachment2 as AttachmentIcon,
		RiArrowRightLine as ArrowRightIcon
	} from 'remixicon-svelte';
	import { cn } from '$lib/utils';
	import { useSettingsSetting, type Setting } from '../settings.svelte';

	const meta: Setting = {
		id: 'navigation',
		title: 'Attachments & History',
		description: 'Manage your chat attachments and history.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<div class="grid grid-cols-2 gap-2 w-full" style={settingState.style}>
	<Item.Root variant="outline" class="bg-card w-full relative group">
		<Item.Content>
			<a href="/settings/attachments">
				<Item.Title class="flex items-center gap-2">
					<AttachmentIcon class="size-4" />
					Attachments
					<span class="absolute inset-0 z-10"></span>
				</Item.Title>
			</a>
			<Item.Description>Manage your chat attachments.</Item.Description>
		</Item.Content>
		<Item.Actions class="md:flex hidden">
			<div
				class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'group-hover:bg-accent/50')}
			>
				<ArrowRightIcon class="size-4" />
			</div>
		</Item.Actions>
	</Item.Root>
	<Item.Root variant="outline" class="bg-card w-full relative group">
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
		<Item.Actions class="md:flex hidden">
			<div
				class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'group-hover:bg-accent/50')}
			>
				<ArrowRightIcon class="size-4" />
			</div>
		</Item.Actions>
	</Item.Root>
</div>
