<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { ComponentProps } from 'svelte';
	import { SettingsLayoutCtx } from '../settings.svelte';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: ComponentProps<typeof Separator> = $props();

	const searchLayout = SettingsLayoutCtx.get();
</script>

<Separator
	class={cn(
		{
			'hidden!': !searchLayout.searchQueryIsEmpty
		},
		className
	)}
	{...restProps}
/>
