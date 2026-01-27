<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Kbd from '$lib/components/ui/kbd';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { cn } from '$lib/utils';
	import { useSettingsSetting, type Setting } from '../settings.svelte';

	let { class: className }: { class?: string } = $props();

	const chatLayoutState = useChatLayout();

	const submitOnEnter = $derived(chatLayoutState.userSettings?.submitOnEnter ?? false);

	const shortcuts = $derived([
		{
			name: 'New Chat',
			keys: [cmdOrCtrl, '⇧', 'O']
		},
		{
			name: 'Model Picker',
			keys: [cmdOrCtrl, '⇧', 'M']
		},
		{
			name: 'Go to Chat',
			keys: [cmdOrCtrl, 'G']
		},
		{
			name: 'Sidebar',
			keys: [cmdOrCtrl, 'B']
		},
		{
			name: 'Submit',
			keys: submitOnEnter ? ['Enter'] : [cmdOrCtrl, 'Enter']
		}
	]);

	const meta: Setting = {
		id: 'keyboard-shortcuts',
		title: 'Keyboard Shortcuts',
		description: 'Quick reference for keyboard shortcuts.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<Card.Root class={cn('flex-row justify-between w-full', className)} style={settingState.style}>
	<Card.Header class="flex-1 flex-col gap-2 h-fit">
		<Card.Title>{meta.title}</Card.Title>
		<Card.Description>{meta.description}</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		{#each shortcuts as shortcut (shortcut.name)}
			<div class="flex items-center justify-between gap-8">
				<span class="text-muted-foreground line-clamp-2 text-balance text-sm font-normal"
					>{shortcut.name}</span
				>
				<Kbd.Group class="gap-1">
					{#each shortcut.keys as key (key)}
						<Kbd.Root class="bg-input border">{key}</Kbd.Root>
					{/each}
				</Kbd.Group>
			</div>
		{/each}
	</Card.Content>
</Card.Root>
