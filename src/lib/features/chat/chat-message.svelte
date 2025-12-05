<script lang="ts">
	import { tv } from 'tailwind-variants';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';
	import type { ChatMessageAssistant, ChatMessageUser } from '$lib/convex/schema';
	import ChatStreamedContent from './chat-streamed-content.svelte';

	const chatMessageVariants = tv({
		base: 'p-4 rounded-lg max-w-3/4 w-fit group/message',
		variants: {
			role: {
				user: 'bg-primary text-primary-foreground self-end',
				assistant: 'bg-secondary text-secondary-foreground'
			}
		}
	});

	type Props = {
		message: ChatMessageUser | ChatMessageAssistant;
	};

	let { message }: Props = $props();
</script>

<div
	data-message-role={message.role}
	class={chatMessageVariants({ role: message.role })}
>
	{#if message.content}
		<Streamdown content={message.content} animationEnabled={false} />
	{:else if message.role === 'assistant'}
		{#if message.error}
			error
			<span class="text-destructive">{message.error}</span>
		{:else}
			streaming
			<ChatStreamedContent {message} />
		{/if}
	{/if}
</div>
