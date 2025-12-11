<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import ChooseModeField from '$lib/features/modes/choose-mode-field.svelte';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { Button } from '$lib/components/ui/button';
	import { api } from '$lib/convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';

	const client = useConvexClient();

	const chatLayoutState = useChatLayout();

	let mode = $derived(chatLayoutState.userSettingsQuery.data?.onboarding?.mode ?? 'advanced');

	async function handleChangeMode() {
		await client.mutation(api.userSettings.updateMode, {
			mode
		});
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Chat Experience</Card.Title>
		<Card.Description>Customize your chat experience.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<ChooseModeField bind:mode />
		<div class="flex items-center justify-end">
			<Button onClickPromise={handleChangeMode}>Save</Button>
		</div>
	</Card.Content>
</Card.Root>
