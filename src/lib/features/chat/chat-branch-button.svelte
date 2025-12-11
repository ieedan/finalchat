<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ModelIdCtx } from '$lib/context.svelte.js';
	import { api } from '$lib/convex/_generated/api';
	import type { MessageWithAttachments } from '$lib/convex/chat.utils';
	import SplitIcon from '@lucide/svelte/icons/split';
	import { useConvexClient } from 'convex-svelte';
	import { useChatLayout } from './chat.svelte';

	type Props = {
		message: MessageWithAttachments;
	};

	let { message }: Props = $props();

	const modelId = ModelIdCtx.get();

	const chatLayoutState = useChatLayout();

	const client = useConvexClient();

	async function branchFromMessage() {
		if (modelId.current === null) return;

		const { newChatId, newAssistantMessageId } = await client.mutation(
			api.chat.branchFromMessage,
			message.role === 'assistant'
				? { message: { _id: message._id, role: 'assistant' } }
				: {
						message: {
							_id: message._id,
							role: 'user',
							modelId: modelId.current
						}
					}
		);

		if (newAssistantMessageId) {
			chatLayoutState.createdMessages.add(newAssistantMessageId);
		}

		await goto(resolve(`/chat/${newChatId}`));
	}
</script>

<Button variant="ghost" size="icon" onClickPromise={branchFromMessage}>
	<SplitIcon />
</Button>
