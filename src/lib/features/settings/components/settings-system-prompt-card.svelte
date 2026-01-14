<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { toast } from 'svelte-sonner';
	import { useSettingsSetting, type Setting } from '../settings.svelte';
	import { cn } from '$lib/utils';

	const client = useConvexClient();

	const chatLayoutState = useChatLayout();

	let systemPrompt = $derived(chatLayoutState.user?.settings?.systemPrompt ?? '');

	async function handleSave() {
		await client.mutation(api.users.updateSystemPrompt, {
			systemPrompt: systemPrompt
		});

		toast.success('System prompt updated!');
	}

	const systemPromptHasChanged = $derived(
		systemPrompt !== chatLayoutState.user?.settings?.systemPrompt
	);

	const meta: Setting = {
		id: 'system-prompt',
		title: 'System Prompt',
		description:
			'System prompts allow you to customize the default behavior of the AI. This will be sent with every message.'
	};

	const settingState = useSettingsSetting(meta);
</script>

<Card.Root style={settingState.style} class={cn('gap-4')}>
	<Card.Header>
		<Card.Title>{meta.title}</Card.Title>
		<Card.Description>{meta.description}</Card.Description>
	</Card.Header>
	<Card.Content>
		<Textarea placeholder="How should I respond?" bind:value={systemPrompt} />
	</Card.Content>
	<Card.Footer class="flex items-center justify-end">
		<Button onClickPromise={handleSave} disabled={!systemPromptHasChanged}>Save</Button>
	</Card.Footer>
</Card.Root>
