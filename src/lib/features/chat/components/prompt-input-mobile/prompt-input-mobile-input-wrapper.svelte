<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cn(
		'flex-1 w-full border border-border bg-background rounded-4xl overflow-hidden flex flex-col items-center justify-center z-10',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
