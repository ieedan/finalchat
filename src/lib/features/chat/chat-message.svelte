<script lang="ts">
	import { tv } from 'tailwind-variants';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';
	import type { ChatMessageAssistant, ChatMessageUser } from '$lib/convex/schema';
	import ChatStreamedContent from './chat-streamed-content.svelte';
	import { cn } from '$lib/utils';
	import { CopyButton } from '$lib/components/ui/copy-button';

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
	class={cn('flex flex-col gap-2 max-w-full', {
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
				<ChatStreamedContent {message} />
			{/if}
		{/if}
	</div>
	{#if message.content}
		<div class="self-end">
			<CopyButton text={message.content} />
		</div>
	{/if}
</div>
