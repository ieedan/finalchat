import { definePageMetaTags } from 'svelte-meta-tags';

export function load() {
	const pageMetaTags = definePageMetaTags({
		title: 'Customization',
		titleTemplate: '%s ~ Settings ~ Finalchat'
	});

	return { ...pageMetaTags };
}
