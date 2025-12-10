<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h1 class={cn('text-2xl font-semibold', className)} {...rest}>
	{@render children?.()}
</h1>
