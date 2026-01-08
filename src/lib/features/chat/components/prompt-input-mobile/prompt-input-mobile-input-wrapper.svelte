<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('flex-1 w-full border overflow-hidden border-border rounded-4xl flex flex-col items-center justify-center', className)} {...rest}>
	{@render children?.()}
</div>
