<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import { Button } from '$lib/components/ui/button';
	import { api } from '$lib/convex/_generated/api';
	import { RiArrowRightLine as ArrowRightIcon } from 'remixicon-svelte';
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

	const canSubmit = $derived(Boolean(apiKey));

	let submitting = $state(false);
	let skipping = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		if (storage === 'Local') {
			localApiKey.current = apiKey;
		} else {
			await createApiKey({ key: apiKey }).updates(chatLayoutState.apiKeysQuery);
			localApiKey.current = null;
		}

		await convex.mutation(api.userSettings.completeSetupApiKey, {});
		submitting = false;
	}

	async function skip() {
		skipping = true;
		await convex.mutation(api.userSettings.completeSetupApiKey, {});
		skipping = false;
	}
</script>

<form method="POST" onsubmit={submit} class="contents">
	<Modal.Header>
		<Modal.Title>Setup API Key</Modal.Title>
		<Modal.Description>
			Configure your API key to access all models, or continue with free models that have strict rate limits.
		</Modal.Description>
	</Modal.Header>
	<Field.Group class="gap-4">
		<div class="space-y-2">
			<span class="text-sm font-medium">Option 1: Configure API Key</span>
			<p class="text-sm text-muted-foreground">
				Paste an
				<a
					href="https://openrouter.ai/settings/keys"
					target="_blank"
					rel="noopener noreferrer"
					class="underline underline-offset-2 font-medium text-primary"
				>
					OpenRouter
				</a>
				API key to access all models without restrictions.
			</p>
			<ApiKeyInput bind:apiKey bind:storage />
		</div>
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t"></span>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="px-2 text-muted-foreground">Or</span>
			</div>
		</div>
		<div class="space-y-2">
			<span class="text-sm font-medium">Option 2: Continue Without API Key</span>
			<p class="text-sm text-muted-foreground">
				Use free models with strict rate limits. You can add an API key later in settings.
			</p>
			<Button
				type="button"
				variant="outline"
				class="w-full"
				onClickPromise={skip}
				loading={skipping}
			>
				Continue Without API Key
			</Button>
		</div>
	</Field.Group>
	<div class="flex items-center justify-end">
		<div></div>
		<Button type="submit" class="gap-1 w-full md:w-auto" disabled={!canSubmit} loading={submitting}>
			Next
			<ArrowRightIcon />
		</Button>
	</div>
</form>
