<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setupThemeProvider } from './theme-provider-state.svelte';

	type Props = {
		children: Snippet;
		defaultFontPreset?: string | null;
	};

	let { children, defaultFontPreset }: Props = $props();

	setupThemeProvider({
		defaultFontPreset
	});
</script>

{@render children?.()}
