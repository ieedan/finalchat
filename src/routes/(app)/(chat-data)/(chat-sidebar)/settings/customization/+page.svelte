<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { toast } from 'svelte-sonner';
	import SettingsFontCard from '$lib/features/settings/settings-font-card.svelte';
	import SettingsModeCard from '$lib/features/settings/settings-mode-card.svelte';
	import SettingsSubmitBehaviorCard from '$lib/features/settings/settings-submit-behavior-card.svelte';

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
</script>

<AccountSettings.Page>
	<Card.Root class="gap-4">
		<Card.Header>
			<Card.Title>System Prompt</Card.Title>
			<Card.Description>
				System prompts allow you to customize the default behavior of the AI. This will be sent with
				every message.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Textarea placeholder="How should I respond?" bind:value={systemPrompt} />
		</Card.Content>
		<Card.Footer class="flex items-center justify-end">
			<Button onClickPromise={handleSave} disabled={!systemPromptHasChanged}>Save</Button>
		</Card.Footer>
	</Card.Root>

	<SettingsModeCard />

	<SettingsSubmitBehaviorCard />

	<SettingsFontCard />
</AccountSettings.Page>
