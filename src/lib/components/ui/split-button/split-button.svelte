<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		class: className,
		children,
		open = $bindable(false),
		...rest
	}: HTMLAttributes<HTMLDivElement> & { open?: boolean } = $props();
</script>

<DropdownMenu.Root bind:open>
	<div data-slot="split-button" class={cn('inline-flex items-stretch', className)} {...rest}>
		{@render children?.()}
	</div>
</DropdownMenu.Root>
