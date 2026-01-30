<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ModelIdCtx, ReasoningEffortCtx } from '$lib/context.svelte.js';
	import { api } from '$lib/convex/_generated/api';
	import type { MessageWithAttachments } from '$lib/convex/chats.utils';
	import { RiGitBranchLine as SplitIcon } from 'remixicon-svelte';
	import { useConvexClient } from 'convex-svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { useChatLayout } from './chat.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	type Props = {
		message: MessageWithAttachments;
		createdMessages: Set<Id<'messages'>> | null;
	};

	const chatLayoutState = useChatLayout();

	let { message, createdMessages = $bindable() }: Props = $props();

	const modelId = ModelIdCtx.get();
	const reasoningEffort = ReasoningEffortCtx.get();

	const client = useConvexClient();

	async function branchFromMessage() {
		if (modelId.current === null) return;
		const model = chatLayoutState.models.find((m) => m.id === modelId.current);

		const { newChatId, newAssistantMessageId } = await client.mutation(
			api.chats.branchFromMessage,
			message.role === 'assistant'
				? {
						message: {
							_id: message._id,
							role: 'assistant'
						},
						apiKey: chatLayoutState.apiKey ?? ''
					}
				: {
						message: {
							_id: message._id,
							role: 'user',
							modelId: modelId.current,
							supportedParameters: model?.supported_parameters ?? [],
							inputModalities: model?.architecture.input_modalities ?? ['text'],
							outputModalities: model?.architecture.output_modalities ?? ['text'],
							reasoningEffort: reasoningEffort.current
						},
						apiKey: chatLayoutState.apiKey ?? ''
					}
		);

		if (newAssistantMessageId) {
			createdMessages?.add(newAssistantMessageId);
		}

		await goto(resolve(`/chat/${newChatId}`));
	}
</script>

{#if chatLayoutState.user !== null}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button variant="ghost" size="icon" onClickPromise={branchFromMessage}>
					<SplitIcon />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				{message.role === 'user' ? 'Branch and regenerate' : 'Branch'}
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}
