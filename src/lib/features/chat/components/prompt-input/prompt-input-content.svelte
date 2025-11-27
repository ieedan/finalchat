<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('rounded-lg relative z-10 border bg-background flex flex-col', className)} {...rest}>
	{@render children?.()}
</div>
