<script lang="ts">
	import ChatView from '$lib/features/chat/chat-view.svelte';
	import { useChatView } from '$lib/features/chat/chat.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { page } from '$app/state';

	const chatViewState = useChatView();

	const chatTitle = $derived(chatViewState.chatQuery.data?.title ?? 'Finalchat chat');

	const ogImageUrl = $derived(
		new URL(`/chat/${page.params.chatId}/og.png`, page.url.origin).toString()
	);
</script>

<MetaTags
	title={chatTitle}
	description={chatTitle}
	twitter={{
		cardType: 'summary_large_image',
		title: `${chatTitle} - Finalchat`,
		description: chatTitle,
		image: ogImageUrl,
		creator: '@ieeeedan'
	}}
	openGraph={{
		title: `${chatTitle} - Finalchat`,
		url: page.url.toString(),
		images: [
			{
				url: ogImageUrl,
				width: 1200,
				height: 630,
				alt: `${chatTitle} - Finalchat`
			}
		]
	}}
/>

<ChatView />
