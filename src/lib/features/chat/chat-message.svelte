<script lang="ts">
	import { tv } from 'tailwind-variants';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';
	import type { ChatMessageAssistant, ChatMessageUser } from '$lib/convex/schema';
	import ChatStreamedContent from './chat-streamed-content.svelte';
	import { cn } from '$lib/utils';
	import { CopyButton } from '$lib/components/ui/copy-button';
	import { useChatLayout } from './chat.svelte.js';
	import { formatDuration, type Milliseconds } from '$lib/utils/time.js';
	import { untrack } from 'svelte';

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
		message: ChatMessageUser | ChatMessageAssistant;
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
		})
	});
</script>

<div
	class={cn('flex flex-col gap-1 max-w-full w-full group/message-container', {
		'self-end': message.role === 'user',
		'self-start': message.role === 'assistant'
	})}
>
	<div data-message-role={message.role} class={chatMessageVariants({ role: message.role })}>
		{#if message.content}
			<Streamdown content={message.content} animationEnabled={false} />
		{:else if message.role === 'assistant'}
			{#if message.error}
				<span class="text-destructive">{message.error}</span>
			{:else}
				{#key chatLayoutState.createdMessages.has(message._id)}
					<ChatStreamedContent {message} {driven} />
				{/key}
			{/if}
		{/if}
	</div>
	{#if message.content}
		<div
			class="justify-between w-full group-hover/message-container:opacity-100 opacity-0 flex items-center gap-1 transition-opacity duration-200"
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
						message.meta.tokenUsage ? `${message.meta.tokenUsage} tokens` : null
					]
						.filter(Boolean)
						.join(' ・')}
					{#if metadata}
						<span class="text-xs text-muted-foreground">{metadata}</span>
					{/if}
				{/if}
			</div>
			<CopyButton text={message.content} />
		</div>
	{/if}
</div>
