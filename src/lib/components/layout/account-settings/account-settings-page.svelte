<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('flex flex-col gap-4 p-4', className)} {...rest}>
	{@render children?.()}
</div>
