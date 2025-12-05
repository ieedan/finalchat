<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { Streamdown } from 'svelte-streamdown';
	import type { ChatMessageAssistant, ChatMessageUser } from '$lib/convex/schema';
	import { useChatLayout } from './chat.svelte';
	import { AccessTokenCtx } from '$lib/context.svelte';
	import ChatStreamedContent from './chat-streamed-content.svelte';

	const chatMessageVariants = tv({
		base: 'p-4 rounded-lg max-w-3/4 w-fit',
		variants: {
			role: {
				user: 'bg-primary text-primary-foreground self-end',
				assistant: 'bg-secondary text-secondary-foreground'
			}
		}
	});

	type Props = {
		message: ChatMessageUser | ChatMessageAssistant;
		driven: boolean;
	};

	let { message, driven }: Props = $props();
</script>

<div class={chatMessageVariants({ role: message.role })}>
	{#if message.content}
		<Streamdown content={message.content} />
	{:else if message.role === 'assistant'}
		<ChatStreamedContent {message} {driven} />
	{/if}
</div>
