<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('flex w-full flex-col', className)} {...rest}>
	{@render children?.()}
</div>
