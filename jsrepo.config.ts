import { defineConfig } from 'jsrepo';
import prettier from '@jsrepo/transform-prettier';

export default defineConfig({
	// configure where stuff comes from here
	registries: ['@ieedan/shadcn-svelte-extras'],
	// configure were stuff goes here
	paths: {
		ui: '$lib/components/ui',
		block: '$lib/components',
		hook: '$lib/hooks',
		action: '$lib/actions',
		util: '$lib/utils',
		lib: '$lib'
	},
	transforms: [prettier()]
});
