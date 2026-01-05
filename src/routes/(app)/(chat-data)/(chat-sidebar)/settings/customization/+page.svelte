<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import { MetaTags } from '$lib/components/meta-tags';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { toast } from 'svelte-sonner';
	import SettingsFontCard from '$lib/features/settings/settings-font-card.svelte';

	const client = useConvexClient();

	const chatLayoutState = useChatLayout();

	let systemPrompt = $derived(chatLayoutState.userSettingsQuery.data?.systemPrompt ?? '');

	async function handleSave() {
		await client.mutation(api.userSettings.updateSystemPrompt, {
			systemPrompt: systemPrompt
		});

		toast.success('System prompt updated!');
	}

	const systemPromptHasChanged = $derived(
		systemPrompt !== chatLayoutState.userSettingsQuery.data?.systemPrompt
	);
</script>

<MetaTags title="Customization" />

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

	<SettingsFontCard />
</AccountSettings.Page>
