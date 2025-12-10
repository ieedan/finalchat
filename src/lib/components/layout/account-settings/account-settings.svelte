<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cn(
		'h-full w-full max-w-5xl [--sidebar-width:250px] lg:grid lg:grid-cols-[var(--sidebar-width)_1fr] lg:pl-2 2xl:pl-0',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
