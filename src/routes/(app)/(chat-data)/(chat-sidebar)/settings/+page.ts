import { definePageMetaTags } from 'svelte-meta-tags';

export function load() {
	const pageMetaTags = definePageMetaTags({
		title: 'Account',
		titleTemplate: '%s ~ Settings ~ Finalchat'
	});

	return { ...pageMetaTags };
}

