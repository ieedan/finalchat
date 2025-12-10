<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('relative col-start-2 w-full', className)} {...rest}>
	{@render children?.()}
</div>
