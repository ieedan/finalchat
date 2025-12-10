<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { api } from '$lib/convex/_generated/api';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { useConvexClient } from 'convex-svelte';
	import * as Field from '$lib/components/ui/field';
	import { useLocalApiKey } from '$lib/features/api-keys/local-key-storage.svelte';
	import ApiKeyInput from '../api-keys/api-key-input.svelte';
	import { createApiKey } from '$lib/features/api-keys/api-keys.remote';

	let storage = $state<'Local' | 'Remote'>('Remote');
	let apiKey = $state<string>('');

	const localApiKey = useLocalApiKey();

	const convex = useConvexClient();

	// async function skip() {
	// 	await convex.mutation(api.userSettings.completeSetupApiKey, {});
	// }

	const canSubmit = $derived(Boolean(apiKey));

	async function submit() {
		if (storage === 'Local') {
			localApiKey.current = apiKey;
		} else {
			await createApiKey({ key: apiKey });
			localApiKey.current = null;
		}

		await convex.mutation(api.userSettings.completeSetupApiKey, {});
	}
</script>

<AlertDialog.Header>
	<AlertDialog.Title>Setup API Key</AlertDialog.Title>
	<AlertDialog.Description>
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
	</AlertDialog.Description>
</AlertDialog.Header>
<Field.Group class="gap-2">
	<ApiKeyInput bind:apiKey bind:storage />
</Field.Group>
<div class="flex items-center justify-between">
	<div></div>
	<!-- <Button variant="outline" onClickPromise={skip}>Skip</Button> -->
	<Button class="gap-1" disabled={!canSubmit} onClickPromise={submit}>
		Next
		<ArrowRightIcon />
	</Button>
</div>
