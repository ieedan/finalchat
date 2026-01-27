import { defineConfig } from 'vitest/config';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';
import transformRemixIconImports from 'vite-plugin-transform-remixicon-imports';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), sveltekitOG(), transformRemixIconImports()],
	envPrefix: ['PUBLIC_'],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
