<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...rest }: HTMLAttributes<HTMLSpanElement> = $props();
</script>

<div
	class={cn('text-muted-foreground px-2 pb-2 text-xs font-medium uppercase', className)}
	{...rest}
>
	{@render children?.()}
</div>
