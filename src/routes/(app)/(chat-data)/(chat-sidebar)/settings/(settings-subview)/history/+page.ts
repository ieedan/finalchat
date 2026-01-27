import { definePageMetaTags } from 'svelte-meta-tags';

export function load() {
	const pageMetaTags = definePageMetaTags({
		title: 'History',
		titleTemplate: '%s ~ Settings ~ Finalchat'
	});

	return { ...pageMetaTags };
}
