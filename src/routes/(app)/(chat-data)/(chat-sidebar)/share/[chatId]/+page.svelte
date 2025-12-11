<script lang="ts">
	import { page } from '$app/state';
	import { useQueryWithFallback } from '$lib/convex.svelte.js';
	import { api } from '$lib/convex/_generated/api';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { onMount } from 'svelte';
	import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte.js';
	import { MetaTags } from '$lib/components/meta-tags/index.js';
	import ChatMessage from '$lib/features/chat/chat-message.svelte';
	import { IsMounted } from 'runed';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button/index.js';
	import { useChatLayout } from '$lib/features/chat/chat.svelte.js';

	let { data } = $props();

	const chatLayoutState = useChatLayout();

	const chatQuery = useQueryWithFallback(
		api.chat.getPublic,
		{
			chatId: page.params.chatId as Id<'chat'>
		},
		{
			// svelte-ignore state_referenced_locally
			fallback: data.chat
		}
	);

	let scrollContainer = $state<HTMLElement>();

	const autoScroll = new UseAutoScroll({ startAtBottom: false });
	onMount(() => {
		autoScroll.ref = scrollContainer;
	});

	const isMounted = new IsMounted();
</script>

<MetaTags title={chatQuery.data?.title} description={chatQuery.data?.title} />

<header class="sticky top-0">
	<div class="px-3 py-2.5 w-full flex items-center justify-between z-20">
		<div class="flex items-center gap-2"></div>
		<div class="flex items-center gap-2"></div>
	</div>
	{#if !autoScroll.isAtTop}
		<div class="absolute w-full h-[24px] bg-background mask-b-from-0% -bottom-[14px] z-19"></div>
	{/if}
</header>
<div
	bind:this={scrollContainer}
	class={cn('flex flex-col h-full max-h-full overflow-y-auto items-center', {
		'scroll-smooth': isMounted.current
	})}
>
	<div class="flex flex-col w-full max-w-3xl px-4 flex-1">
		<div
			class="flex flex-col w-full max-w-3xl mt-4 px-4 flex-1 border border-border rounded-md py-3 bg-accent"
		>
			<p class="text-sm">
				You're viewing a shared copy of this chat. Start your own chat
				<a href="/chat" class="underline underline-offset-2">here</a>.
			</p>
		</div>
		<div class="flex-1 flex flex-col gap-2 py-4">
			{#each chatQuery.data?.messages as message (message._id)}
				<ChatMessage
					{message}
					apiKey={chatLayoutState.apiKey}
					bind:createdMessages={chatLayoutState.createdMessages}
				/>
			{/each}
		</div>
	</div>
	<div class="sticky bottom-0 pb-4">
		<Button href="/chat">Start your own chat</Button>
	</div>
</div>
