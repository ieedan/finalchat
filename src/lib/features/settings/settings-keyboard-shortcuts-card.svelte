<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Kbd from '$lib/components/ui/kbd';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';

	const chatLayoutState = useChatLayout();

	const submitOnEnter = $derived(chatLayoutState.userSettingsQuery.data?.submitOnEnter ?? false);

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
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Keyboard Shortcuts</Card.Title>
		<Card.Description>Quick reference for keyboard shortcuts.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		{#each shortcuts as shortcut (shortcut.name)}
			<div class="flex items-center justify-between gap-8">
				<span class="text-muted-foreground">{shortcut.name}</span>
				<Kbd.Group class="gap-1">
					{#each shortcut.keys as key (key)}
						<Kbd.Root>{key}</Kbd.Root>
					{/each}
				</Kbd.Group>
			</div>
		{/each}
	</Card.Content>
</Card.Root>
