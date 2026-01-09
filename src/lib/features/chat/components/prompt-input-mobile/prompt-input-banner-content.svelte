<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cn('flex items-center justify-between w-full py-1.5 gap-2 text-sm', className)}
	{...rest}
>
	{@render children?.()}
</div>
