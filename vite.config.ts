import { defineConfig } from 'vitest/config';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import transformLucideImports from 'vite-plugin-transform-lucide-imports';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), transformLucideImports(), sveltekitOG()],
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
