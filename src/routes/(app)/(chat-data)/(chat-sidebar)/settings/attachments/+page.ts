import { definePageMetaTags } from 'svelte-meta-tags';

export function load() {
	const pageMetaTags = definePageMetaTags({
		title: 'Attachments',
		titleTemplate: '%s ~ Settings ~ Finalchat'
	});

	return { ...pageMetaTags };
}
