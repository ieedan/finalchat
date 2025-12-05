<script lang="ts">
	import { AccessTokenCtx } from '$lib/context.svelte';
	import { api } from '$lib/convex/_generated/api';
	import type { ChatMessageAssistant } from '$lib/convex/schema';
	import { env } from '$lib/env.client';
	import { useStream } from '$lib/utils/persistent-text-streaming.svelte.js';
	import type { StreamId } from '@convex-dev/persistent-text-streaming';
	import { useChatLayout } from './chat.svelte';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';

	type Props = {
		message: ChatMessageAssistant;
	};

	let { message }: Props = $props();

	const accessToken = AccessTokenCtx.get();
	const chatState = useChatLayout();

	const streamBody = useStream({
		getPersistentBody: api.messages.getChatBody,
		streamUrl: new URL('/messages/stream', env.PUBLIC_CONVEX_SITE_URL),
		// svelte-ignore state_referenced_locally
		get driven() {
			return chatState.createdMessages.has(message._id);
		},
		// svelte-ignore state_referenced_locally
		chatId: message.chatId,
		// svelte-ignore state_referenced_locally
		streamId: message.streamId as StreamId,
		get apiKey() {
			return chatState.apiKey;
		},
		authToken: accessToken?.current
	});
</script>

<Streamdown content={streamBody.body.text} />
