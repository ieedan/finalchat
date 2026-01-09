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

<DropdownMenu.Item class={cn(className)} {...restProps}>
	{@render children?.()}
</DropdownMenu.Item>
