<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { useSettingsSetting, type Setting } from '../settings.svelte';

	const client = useConvexClient();
	const chatLayoutState = useChatLayout();

	let memoryEnabled = $derived(chatLayoutState.userSettings?.memoryEnabled ?? false);

	async function handleChange(value: boolean) {
		await client.mutation(api.userSettings.updateMemoryEnabled, {
			memoryEnabled: value
		});
	}

	const meta: Setting = {
		id: 'memory-enabled',
		title: 'Past chat memory',
		description: 'Allow the assistant to use tools that search and open your other conversations.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<Card.Root class="w-full" style={settingState.style}>
	<Card.Content>
		<div class="flex items-center justify-between gap-4">
			<div class="flex flex-col gap-1">
				<Label for="memory-enabled" class="text-sm font-medium">Past chat memory</Label>
				<p class="text-xs text-muted-foreground">
					When enabled, the model can recall information from your other chats when it uses tools.
				</p>
			</div>
			<Switch id="memory-enabled" bind:checked={memoryEnabled} onCheckedChange={handleChange} />
		</div>
	</Card.Content>
</Card.Root>
