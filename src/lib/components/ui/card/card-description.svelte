<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLParagraphElement>> = $props();
</script>

<p
	bind:this={ref}
	data-slot="card-description"
	class={cn(
		'text-muted-foreground line-clamp-2 text-balance text-sm font-normal leading-normal',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</p>
