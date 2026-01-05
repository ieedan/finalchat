<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setupThemeProvider } from './theme-provider-state.svelte';

	type Props = {
		children: Snippet;
		defaultFontSans?: string | null;
		defaultFontMono?: string | null;
	};

	let { children, defaultFontSans, defaultFontMono }: Props = $props();

	setupThemeProvider({
		defaultFontSans: defaultFontSans,
		defaultFontMono: defaultFontMono
	});
</script>

{@render children?.()}
