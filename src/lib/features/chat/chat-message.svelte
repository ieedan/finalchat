<script lang="ts">
	import { tv } from 'tailwind-variants';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';
	import ChatStreamedContent from './chat-streamed-content.svelte';
	import { cn } from '$lib/utils';
	import { CopyButton } from '$lib/components/ui/copy-button';
	import { useChatLayout } from './chat.svelte.js';
	import { formatDuration, type Milliseconds } from '$lib/utils/time.js';
	import { untrack } from 'svelte';
	import ChatAssistantMessage from './chat-assistant-message.svelte';
	import type { MessageWithAttachments } from '$lib/convex/chat.utils.js';

	const chatMessageVariants = tv({
		base: 'rounded-lg max-w-full w-fit group/message',
		variants: {
			role: {
				user: 'bg-secondary self-end p-4',
				assistant: 'bg-background text-foreground'
			}
		}
	});

	type Props = {
		message: MessageWithAttachments;
	};

	let { message }: Props = $props();

	const chatLayoutState = useChatLayout();

	// this is weird but basically we only care if we transition to a driven state not if we transition out of it
	let driven = $state(false);
	$effect(() => {
		const d = chatLayoutState.createdMessages.has(message._id);
		untrack(() => {
			if (d) {
				driven = true;
				// once we are driving remove the id so we can't drive again
				chatLayoutState.createdMessages.delete(message._id);
			}
		});
	});

	const tokensPerSecond = $derived.by(() => {
		if (message.role !== 'assistant') return null;
		if (
			!message.meta.tokenUsage ||
			!message.meta.startedGenerating ||
			!message.meta.stoppedGenerating
		)
			return null;
		const durationSeconds =
			(message.meta.stoppedGenerating - message.meta.startedGenerating) / 1000;
		if (durationSeconds > 0) {
			return (message.meta.tokenUsage / durationSeconds).toFixed(0);
		}
		return null;
	});
</script>

<div
	class={cn('flex flex-col gap-1 max-w-full w-full group/message-container', {
		'self-end': message.role === 'user',
		'self-start': message.role === 'assistant'
	})}
>
	{#if message.role === 'user'}
		{#if message.attachments}
			<div class="w-full justify-end flex items-center gap-2">
				{#each message.attachments as attachment}
					<a
						href={attachment.url}
						target="_blank"
						rel="noopener noreferrer"
						class="overflow-hidden rounded-md border border-border size-[120px]"
					>
						<img src={attachment.url} alt="Attachment" class="object-cover" />
					</a>
				{/each}
			</div>
		{/if}
	{/if}
	<div data-message-role={message.role} class={chatMessageVariants({ role: message.role })}>
		{#if message.role === 'assistant'}
			{#if message.content !== undefined}
				<ChatAssistantMessage {message} animationEnabled={false} />
			{:else if message.error}
				<span class="text-destructive">{message.error}</span>
			{:else}
				{#key chatLayoutState.createdMessages.has(message._id)}
					<ChatStreamedContent {message} {driven} />
				{/key}
			{/if}
		{:else}
			<Streamdown content={message.content} animationEnabled={false} />
		{/if}
	</div>
	{#if message.content}
		<div
			class="justify-between w-full group-hover/message-container:opacity-100 md:opacity-0 flex items-center gap-1 transition-opacity duration-200"
		>
			<div>
				{#if message.role === 'assistant'}
					{@const metadata = [
						message.meta.startedGenerating && message.meta.stoppedGenerating
							? formatDuration(
									(message.meta.stoppedGenerating - message.meta.startedGenerating) as Milliseconds
								)
							: null,
						message.meta.cost ? `$${message.meta.cost}` : null,
						message.meta.tokenUsage ? `${message.meta.tokenUsage} tokens` : null,
						message.meta.tokenUsage &&
						message.meta.startedGenerating &&
						message.meta.stoppedGenerating
							? `${tokensPerSecond} tokens/sec`
							: null
					]
						.filter(Boolean)
						.join(' ・')}
					{#if metadata}
						<span class="text-xs text-muted-foreground">{metadata}</span>
					{/if}
				{/if}
			</div>
			<CopyButton
				text={message.role === 'assistant'
					? message.parts
							.filter((p) => p.type === 'text')
							.map((p) => p.text)
							.join('')
					: message.content}
			/>
		</div>
	{/if}
</div>
