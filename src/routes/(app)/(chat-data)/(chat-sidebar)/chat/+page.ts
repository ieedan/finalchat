import { definePageMetaTags } from 'svelte-meta-tags';

export function load({ url }) {
	const ogImageUrl = new URL('/chat/og.png', url.origin).toString();

	const pageMetaTags = definePageMetaTags({
		title: 'New Chat',
		twitter: {
			cardType: 'summary_large_image',
			title: 'New Chat - Finalchat',
			description: 'Chat with any model available on OpenRouter with your own API key.',
			image: ogImageUrl,
			creator: '@ieeeedan'
		},
		openGraph: {
			title: 'New Chat - Finalchat',
			url: url.toString(),
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: 'New Chat - Finalchat'
				}
			]
		}
	});

	return {
		...pageMetaTags,
		query: url.searchParams.get('q')
	};
}
