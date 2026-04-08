<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setupThemeProvider } from './theme-provider-state.svelte';
	import { box } from 'svelte-toolbelt';

	type Props = {
		children: Snippet;
		defaultFontPreset?: string | null;
		animate: boolean;
	};

	let { children, defaultFontPreset, animate }: Props = $props();

	setupThemeProvider({
		defaultFontPreset: box.with(
			() => defaultFontPreset,
			(v) => (defaultFontPreset = v)
		),
		animate: box.with(
			() => animate,
			(v) => (animate = v)
		)
	});
</script>

{@render children?.()}
