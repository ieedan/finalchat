<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { ScrollState } from 'runed';

	let {
		ref = $bindable(null),
		class: className,
		children
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();

	const scrollState = new ScrollState({
		element: () => ref
	});
</script>

<div
	data-slot="sidebar-content"
	data-sidebar="content"
	class={cn('min-h-0 flex-1 relative group-data-[collapsible=icon]:overflow-hidden', className)}
>
	<div
		class={cn(
			'absolute z-20 h-10 bg-sidebar mask-b-from-25% top-0 w-full opacity-0 transition-opacity ease-in-out',
			!scrollState.arrived.top && 'opacity-100'
		)}
	></div>
	<div bind:this={ref} class="h-full overflow-y-auto overflow-x-hidden flex flex-col gap-2">
		{@render children?.()}
	</div>
	<div
		class={cn(
			'absolute z-20 h-10 bg-sidebar mask-t-from-25% -bottom-px w-full opacity-0 transition-opacity ease-in-out',
			!scrollState.arrived.bottom && 'opacity-100'
		)}
	></div>
</div>
