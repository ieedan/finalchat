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

	let mode: 'basic' | 'advanced' = $derived(chatLayoutState.isAdvancedMode ? 'advanced' : 'basic');

	async function handleChangeMode() {
		await client.mutation(api.users.updateMode, {
			mode
		});

		// Set the default model based on the selected mode
		if (mode === 'basic') {
			modelId.current = BASIC_MODELS[0].id;
		} else {
			// For advanced mode, use the first model from the available models
			// or the first favorite model if available
			const favoriteModels = chatLayoutState.enabledModels;
			modelId.current =
				favoriteModels.length > 0 ? favoriteModels[0].id : (chatLayoutState.models[0]?.id ?? null);
		}

		toast.success('Mode updated!');
	}

	const modeHasChanged = $derived(mode !== chatLayoutState.user?.settings?.onboarding?.mode);
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
