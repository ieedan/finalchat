<script lang="ts">
	import type { StreamResult } from '$lib/utils/stream-transport-protocol';
	import type { ChatMessageAssistant } from '$lib/convex/schema';
	import ChatReasoningPart from './chat-reasoning-part.svelte';
	import Streamdown from './components/streamdown.svelte';
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import ChatToolPart from './chat-tool-part.svelte';
	import type { ToolResultPart } from 'ai';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { Skeleton } from '$lib/components/ui/skeleton';

	type Props = {
		message: ChatMessageAssistant & {
			parts: StreamResult;
			attachments: (Doc<'chatAttachments'> & { url: string })[];
		};
		animationEnabled: boolean;
	};

	let { message, animationEnabled }: Props = $props();
</script>

{#if message.parts.length === 0}
	{#if message.meta.stoppedGenerating === undefined}
		<ShinyText>Thinking...</ShinyText>
	{:else}
		<span class="text-destructive">Error generating message</span>
	{/if}
{:else}
	{#each message.parts as part, i (i)}
		{#if part.type === 'reasoning'}
			<ChatReasoningPart {part} isLastPart={i === message.parts.length - 1 && message.attachments.length === 0} />
		{:else if part.type === 'text'}
			<Streamdown content={part.text} {animationEnabled} />
		{:else if part.type === 'tool-call'}
			{@const toolCallResult = message.parts.find(
				(p) => p.type === 'tool-result' && p.toolCallId === part.toolCallId
			)}
			<ChatToolPart tool={{ ...part, result: toolCallResult as ToolResultPart }} />
		{/if}
	{/each}
	{#if message.attachments.length > 0}
		<div class="flex flex-col gap-2 not-first:mt-2">
			{#each message.attachments as attachment}
				<a
					href={attachment.url}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md overflow-hidden max-w-sm"
				>
					<img src={attachment.url} alt="Attachment" class="object-cover" />
				</a>
			{/each}
		</div>
	{:else if message.meta.imageGen}
		<Skeleton class="max-w-sm w-full aspect-square"/>
	{/if}
{/if}
