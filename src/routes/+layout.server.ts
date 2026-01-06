import { defineBaseMetaTags } from "svelte-meta-tags";

export async function load(event) {
	const baseMetaTags = defineBaseMetaTags({
		title: 'Finalchat',
		titleTemplate: '%s ~ Finalchat',
		description: 'Chat with any model available on OpenRouter with your own API key.',
		canonical: new URL(event.url.pathname, event.url.origin).href
	});
	
	const fontPreset = event.cookies.get('theme-font-preset') ?? null;

	return {
		...baseMetaTags,
		accessToken: event.locals.auth.accessToken,
		user: event.locals.auth.user,
		fontPreset
	};
}
