<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import ChooseModeField from '$lib/features/modes/choose-mode-field.svelte';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { Button } from '$lib/components/ui/button';
	import { api } from '$lib/convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';
	import { ModelIdCtx } from '$lib/context.svelte';
	import { BASIC_MODELS } from '$lib/ai';
	import { toast } from 'svelte-sonner';

	const client = useConvexClient();

	const chatLayoutState = useChatLayout();

	const modelId = ModelIdCtx.get();

	let mode = $derived(chatLayoutState.userSettingsQuery.data?.onboarding?.mode ?? 'advanced');

	async function handleChangeMode() {
		await client.mutation(api.userSettings.updateMode, {
			mode
		});

		modelId.current = BASIC_MODELS[0].id;

		toast.success('Mode updated!');
	}

	const modeHasChanged = $derived(
		mode !== chatLayoutState.userSettingsQuery.data?.onboarding?.mode
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Chat Experience</Card.Title>
		<Card.Description>Customize your chat experience.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<ChooseModeField bind:mode />
		<div class="flex items-center justify-end">
			<Button onClickPromise={handleChangeMode} disabled={!modeHasChanged}>Save</Button>
		</div>
	</Card.Content>
</Card.Root>
