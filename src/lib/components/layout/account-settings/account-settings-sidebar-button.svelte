<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { active } from '$lib/actions/active.svelte';

	let {
		children,
		class: className,
		activeForSubdirectories = false,
		isHash,
		isSearch,
		onclick,
		...rest
	}: HTMLAnchorAttributes & {
		activeForSubdirectories?: boolean;
		isHash?: boolean;
		isSearch?: boolean;
	} = $props();
</script>

<a
	class={cn(
		'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary-foreground not-last:mb-1 flex w-full flex-col gap-2 rounded-md px-6 py-2 transition-colors lg:px-3',
		className
	)}
	onclick={(e) => {
		onclick?.(e);
	}}
	use:active={{ activeForSubdirectories: activeForSubdirectories, isHash, isSearch }}
	{...rest}
>
	{@render children?.()}
</a>
