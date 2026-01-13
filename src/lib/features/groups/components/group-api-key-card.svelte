<script lang="ts" module>
	import { z } from 'zod';

	const UpdateGroupApiKeySchema = z.object({
		apiKey: z.string().min(1)
	});
</script>

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import ApiKeyInput from '$lib/features/api-keys/api-key-input.svelte';
	import { encryptApiKey } from '$lib/features/api-keys/api-keys.remote';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { useConvexClient } from 'convex-svelte';
	import { Button } from '$lib/components/ui/button';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { toast } from 'svelte-sonner';
	import { api } from '$lib/convex/_generated/api';
	import { resource } from 'runed';
	import type { ApiKey } from '$lib/features/models/openrouter';
	import { Skeleton } from '$lib/components/ui/skeleton';

	const chatLayoutState = useChatLayout();

	const client = useConvexClient();

	const uid = $props.id();

	const form = superForm(
		defaults(
			{
				get apiKey() {
					return chatLayoutState.apiKey ?? '';
				}
			},
			zod4(UpdateGroupApiKeySchema)
		),
		{
			id: uid,
			validators: zod4(UpdateGroupApiKeySchema),
			onUpdate: async ({ form }) => {
				if (!form.valid) return;

				try {
					const encryptedApiKey = await encryptApiKey({ key: form.data.apiKey });
					await client.mutation(api.groups.updateGroupApiKey, {
						apiKey: encryptedApiKey
					});
				} catch (error) {
					toast.error('Failed to save API key', {
						description: error instanceof Error ? error.message : 'Unknown error'
					});
				}
			},
			SPA: true,
			dataType: 'json'
		}
	);

	const { form: fd, enhance, submitting } = form;

	const apiKeyInfoResource = resource(
		() => $fd.apiKey,
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

<Card.Root class="gap-3">
	<form use:enhance method="POST" class="contents">
		<Card.Header>
			<Card.Title>API Key</Card.Title>
			<Card.Description>This is only visible to admins.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Field.Group>
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<ApiKeyInput bind:apiKey={$fd.apiKey} />
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
										We encountered an error while trying to check your usage. Please try again
										later.
									</span>
								{:else}
									<Skeleton class="h-6 w-[200px]" />
								{/if}
							</div>
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</Field.Group>
		</Card.Content>
		<Card.Footer class="flex items-center justify-end">
			<Button type="submit" variant="default" loading={$submitting}>Save</Button>
		</Card.Footer>
	</form>
</Card.Root>
