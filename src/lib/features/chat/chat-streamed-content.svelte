<script lang="ts">
	import { AccessTokenCtx } from '$lib/context.svelte';
	import { api } from '$lib/convex/_generated/api';
	import type { ChatMessageAssistant } from '$lib/convex/schema';
	import { env } from '$lib/env.client';
	import { useStream } from '$lib/utils/persistent-text-streaming.svelte.js';
	import type { StreamId } from '@convex-dev/persistent-text-streaming';
	import { useChatLayout } from './chat.svelte';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import { deserializeStreamBody } from '$lib/utils/reasoning-custom-protocol';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import BrainIcon from '@lucide/svelte/icons/brain';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { Spinner } from '$lib/components/ui/spinner';

	type Props = {
		message: ChatMessageAssistant;
		driven: boolean;
	};

	let { message, driven }: Props = $props();

	const accessToken = AccessTokenCtx.get();
	const chatState = useChatLayout();

	const streamBody = useStream({
		getPersistentBody: api.messages.getChatBody,
		streamUrl: new URL('/messages/stream', env.PUBLIC_CONVEX_SITE_URL),
		// svelte-ignore state_referenced_locally
		driven,
		// svelte-ignore state_referenced_locally
		chatId: message.chatId,
		// svelte-ignore state_referenced_locally
		streamId: message.streamId as StreamId,
		get apiKey() {
			return chatState.apiKey;
		},
		authToken: accessToken?.current
	});

	const { text, reasoning } = $derived(deserializeStreamBody(streamBody.body.text));

	let showReasoning = $state(false);
</script>

{#if text === '' && reasoning === ''}
	<ShinyText>Thinking...</ShinyText>
{:else if reasoning !== ''}
	{#if reasoning !== ''}
		<div class="pb-2">
			<Collapsible.Root bind:open={showReasoning} class="flex flex-col gap-2">
				<Collapsible.Trigger class="flex items-center gap-2">
					<BrainIcon class="size-4" />
					Reasoning
					{#if text === ''}
						<Spinner />
					{/if}
					{#if showReasoning}
						<ChevronUpIcon class="size-4" />
					{:else}
						<ChevronDownIcon class="size-4" />
					{/if}
				</Collapsible.Trigger>
				<Collapsible.Content class="bg-card rounded-lg p-4">
					<Streamdown content={reasoning} animationEnabled={false} />
				</Collapsible.Content>
			</Collapsible.Root>
		</div>
	{/if}
{/if}
<Streamdown content={text} />
