<script lang="ts">
	import type { StreamResult } from '$lib/utils/stream-transport-protocol';
	import type { ChatMessageAssistant } from '$lib/convex/schema';
	import ChatReasoningPart from './chat-reasoning-part.svelte';
	import Streamdown from './components/streamdown.svelte';
	import ShinyText from '$lib/components/animations/shiny-text.svelte';

	type Props = {
		message: ChatMessageAssistant & {
			parts: StreamResult;
		};
		animationEnabled: boolean;
	};

	let { message, animationEnabled }: Props = $props();
</script>

{#if message.parts.length === 0}
	<ShinyText>Thinking...</ShinyText>
{:else}
	{#each message.parts as part, i (i)}
		{#if part.type === 'reasoning'}
			<ChatReasoningPart {part} isLastPart={i === message.parts.length - 1} />
		{:else if part.type === 'text'}
			<Streamdown content={part.text} {animationEnabled} />
		{:else if part.type === 'tool-call'}
			{@const toolCallResult = message.parts.find(
				(p) => p.type === 'tool-result' && p.toolCallId === part.toolCallId
			)}
			<div class="border border-border rounded-md bg-accent">
				{part.toolCallId}:{part.toolName} was called
				{#if toolCallResult && toolCallResult.type === 'tool-result'}
					Got result:
					<pre>
                    {JSON.stringify(toolCallResult.output, null, 2)}
                </pre>
				{/if}
			</div>
		{/if}
	{/each}
{/if}
