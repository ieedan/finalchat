<script lang="ts">
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import * as Card from '$lib/components/ui/card';
	import ApiKeyInput from '../api-keys/api-key-input.svelte';
	import { useLocalApiKey } from '../api-keys/local-key-storage.svelte';
	import { createApiKey } from '../api-keys/api-keys.remote';
	import { Button } from '$lib/components/ui/button';
	import type { ApiKey } from '../models/openrouter';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { resource } from 'runed';

	const chatLayoutState = useChatLayout();

	const localApiKey = useLocalApiKey();

	let storage: 'Local' | 'Remote' = $derived(localApiKey.current ? 'Local' : 'Remote');
	let apiKey = $derived<string>(chatLayoutState.apiKey ?? '');

	let loading = $state(false);

	async function handleSave() {
		loading = true;
		if (storage === 'Local') {
			localApiKey.current = apiKey;
		} else {
			await createApiKey({ key: apiKey }).updates(chatLayoutState.apiKeysQuery);
			localApiKey.current = null;
		}
		loading = false;
	}

	const canSubmit = $derived(Boolean(apiKey));

	const apiKeyInfoResource = resource(
		() => chatLayoutState.apiKey,
		async (key) => {
			if (!key) return null;

			const res = await fetch('https://openrouter.ai/api/v1/key', {
				headers: {
					Authorization: `Bearer ${key}`,
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) {
				throw new Error('Failed to fetch API key info');
			}

			const { data } = await res.json();

			return data as ApiKey;
		}
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>API Key</Card.Title>
		<Card.Description>Manage your API key.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
            method="POST"
			onsubmit={(e) => {
				e.preventDefault();
				handleSave();
			}}
			class="flex flex-col gap-4"
		>
			<div class="flex flex-col gap-1">
				<ApiKeyInput bind:apiKey bind:storage />
				<div>
					{#if apiKeyInfoResource.current}
						<span class="text-muted-foreground flex h-6 place-items-center text-xs">
							${apiKeyInfoResource.current?.usage?.toFixed(3)} / {apiKeyInfoResource.current
								?.limit
								? `${apiKeyInfoResource.current?.limit?.toFixed(3)}`
								: '∞'}
						</span>
					{:else if apiKeyInfoResource.error}
						<span
							class="flex h-6 w-fit place-items-center rounded-lg px-2 text-xs text-destructive"
						>
							We encountered an error while trying to check your usage. Please try again later.
						</span>
					{:else}
						<Skeleton class="h-6 w-[200px]" />
					{/if}
				</div>
			</div>
			<div class="flex items-center justify-end">
				<Button type="submit" disabled={!canSubmit} {loading}>Save</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
