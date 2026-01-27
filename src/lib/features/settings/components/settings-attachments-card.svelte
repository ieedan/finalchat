<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		RiAttachment2 as AttachmentIcon,
		RiArrowRightLine as ArrowRightIcon
	} from 'remixicon-svelte';
	import { cn } from '$lib/utils';
	import { useSettingsSetting, type Setting } from '../settings.svelte';

	const meta: Setting = {
		id: 'attachments',
		title: 'Attachments',
		description: 'Manage your chat attachments.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<Item.Root variant="outline" class="bg-card w-full relative group" style={settingState.style}>
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
	<Item.Actions>
		<div class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'group-hover:bg-accent/50')}>
			<ArrowRightIcon class="size-4" />
		</div>
	</Item.Actions>
</Item.Root>
