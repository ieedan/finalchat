<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils';
	import type { ComponentProps } from 'svelte';

	let {
		children,
		class: className,
		...restProps
	}: ComponentProps<typeof DropdownMenu.Item> = $props();
</script>

<DropdownMenu.Item class={cn('py-2.5 px-3 rounded-2xl', className)} {...restProps}>
	{@render children?.()}
</DropdownMenu.Item>
