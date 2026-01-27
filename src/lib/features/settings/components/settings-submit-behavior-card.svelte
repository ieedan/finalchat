<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
	import * as Kbd from '$lib/components/ui/kbd';
	import { useSettingsSetting, type Setting } from '../settings.svelte';

	const client = useConvexClient();
	const chatLayoutState = useChatLayout();

	let submitOnEnter = $derived(chatLayoutState.userSettings?.submitOnEnter ?? false);

	async function handleChange(value: boolean) {
		await client.mutation(api.userSettings.updateSubmitOnEnter, {
			submitOnEnter: value
		});
	}

	const meta: Setting = {
		id: 'submit-behavior',
		title: 'Submit on Enter',
		description: 'Customize the behavior of the submit button.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<Card.Root class="w-full" style={settingState.style}>
	<Card.Content>
		<div class="flex items-center justify-between gap-4">
			<div class="flex flex-col gap-1">
				<Label for="submit-on-enter" class="text-sm font-medium">Submit on Enter</Label>
				<p class="text-xs text-muted-foreground">
					{#if submitOnEnter}
						Press <Kbd.Root>Enter</Kbd.Root> to send, <Kbd.Root>Shift</Kbd.Root>+<Kbd.Root
							>Enter</Kbd.Root
						> for new line
					{:else}
						Press <Kbd.Root>Enter</Kbd.Root> for new line, <Kbd.Root>{cmdOrCtrl}</Kbd.Root
						>+<Kbd.Root>Enter</Kbd.Root> to send
					{/if}
				</p>
			</div>
			<Switch id="submit-on-enter" bind:checked={submitOnEnter} onCheckedChange={handleChange} />
		</div>
	</Card.Content>
</Card.Root>
