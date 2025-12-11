<script lang="ts">
	import { AccessTokenCtx } from '$lib/context.svelte';
	import { api } from '$lib/convex/_generated/api';
	import type { ChatMessageAssistant } from '$lib/convex/schema';
	import { env } from '$lib/env.client';
	import { useStream } from '$lib/utils/persistent-text-streaming.svelte.js';
	import type { StreamId } from '@convex-dev/persistent-text-streaming';
	import { useChatLayout } from './chat.svelte';
	import { deserializeStream } from '$lib/utils/stream-transport-protocol';
	import ChatAssistantMessage from './chat-assistant-message.svelte';
	import ShinyText from '$lib/components/animations/shiny-text.svelte';

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

	const deserializedResult = $derived(deserializeStream({ text: streamBody.body.text }));
</script>

{#if streamBody.body.text.length === 0}
	<ShinyText>Thinking...</ShinyText>
{:else if deserializedResult.isOk()}
	<ChatAssistantMessage
		message={{ ...message, parts: deserializedResult.value.stack }}
		animationEnabled={true}
	/>
{/if}
