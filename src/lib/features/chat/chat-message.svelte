<script lang="ts">
	import { tv } from 'tailwind-variants';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';
	import type { ChatMessageAssistant, ChatMessageUser } from '$lib/convex/schema';
	import ChatStreamedContent from './chat-streamed-content.svelte';

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
</script>

<div
	data-message-role={message.role}
	class={chatMessageVariants({ role: message.role })}
>
	{#if message.content}
		<Streamdown content={message.content} animationEnabled={false} />
	{:else if message.role === 'assistant'}
		{#if message.error}
			<span class="text-destructive">{message.error}</span>
		{:else}
			<ChatStreamedContent {message} />
		{/if}
	{/if}
</div>
