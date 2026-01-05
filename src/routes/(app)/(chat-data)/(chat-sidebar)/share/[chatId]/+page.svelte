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
	import { useSidebar } from '$lib/components/ui/sidebar';

	let { data } = $props();

	const chatLayoutState = useChatLayout();

	const chatQuery = useQueryWithFallback(
		api.chats.getPublic,
		{
			chatId: page.params.chatId as Id<'chats'>
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

	const sidebar = useSidebar();
</script>

<MetaTags
	title={chatQuery.data?.title}
	description={chatQuery.data?.title}
	openGraph={{
		title: `${chatQuery.data?.title} - Finalchat`,
		url: page.url.toString(),
		images: [
			{
				url: `/chat/${chatQuery.data?._id}/og.png`,
				width: 1200,
				height: 630,
				alt: `${chatQuery.data?.title} - Finalchat`
			}
		]
	}}
/>

<header class="sticky top-0">
	<div class="px-3 py-2.5 w-full flex items-center justify-between z-20 h-14">
		<div class="flex items-center gap-4">
			<div
				data-visible={sidebar.isMobile || !sidebar.open}
				class="size-9 data-[visible=false]:w-0 transition-all duration-200"
			></div>
			<span class="text-foreground text-sm">{chatQuery.data?.title}</span>
		</div>
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
				You're viewing a shared chat. Start your own chat
				<a href="/chat" class="underline underline-offset-2">here</a>.
			</p>
		</div>
		<div class="flex-1 flex flex-col gap-2 py-4">
			{#each chatQuery.data?.messages as message (message._id)}
				<ChatMessage
					{message}
					apiKey={chatLayoutState.apiKey}
					bind:createdMessages={chatLayoutState.createdMessages}
					systemPrompt={chatLayoutState.userSettingsQuery.data?.systemPrompt ?? null}
				/>
			{/each}
		</div>
	</div>
	<div class="sticky bottom-0 pb-4">
		<Button href="/chat">Start your own chat</Button>
	</div>
</div>
