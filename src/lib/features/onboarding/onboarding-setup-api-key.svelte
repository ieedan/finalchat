<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import { Button } from '$lib/components/ui/button';
	import { api } from '$lib/convex/_generated/api';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { useConvexClient } from 'convex-svelte';
	import * as Field from '$lib/components/ui/field';
	import { useLocalApiKey } from '$lib/features/api-keys/local-key-storage.svelte';
	import ApiKeyInput from '../api-keys/api-key-input.svelte';
	import { createApiKey } from '$lib/features/api-keys/api-keys.remote';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';

	let storage = $state<'Local' | 'Remote'>('Remote');
	let apiKey = $state<string>('');

	const chatLayoutState = useChatLayout();

	const localApiKey = useLocalApiKey();

	const convex = useConvexClient();

	// async function skip() {
	// 	await convex.mutation(api.users.completeSetupApiKey, {});
	// }

	const canSubmit = $derived(Boolean(apiKey));

	let submitting = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		if (storage === 'Local') {
			localApiKey.current = apiKey;
		} else {
			await createApiKey({ key: apiKey }).updates(chatLayoutState.apiKeysQuery);
			localApiKey.current = null;
		}

		await convex.mutation(api.users.completeSetupApiKey, {});
		submitting = false;
	}
</script>

<form method="POST" onsubmit={submit} class="contents">
	<Modal.Header>
		<Modal.Title>Setup API Key</Modal.Title>
		<Modal.Description>
			Paste an
			<a
				href="https://openrouter.ai/settings/keys"
				target="_blank"
				rel="noopener noreferrer"
				class="underline underline-offset-2 font-medium text-primary"
			>
				OpenRouter
			</a>
			API key to get started.
		</Modal.Description>
	</Modal.Header>
	<Field.Group class="gap-2">
		<ApiKeyInput bind:apiKey bind:storage />
	</Field.Group>
	<div class="flex items-center justify-end">
		<!-- <Button variant="outline" onClickPromise={skip}>Skip</Button> -->
		<Button type="submit" class="gap-1 w-full md:w-auto" disabled={!canSubmit} loading={submitting}>
			Next
			<ArrowRightIcon />
		</Button>
	</div>
</form>
