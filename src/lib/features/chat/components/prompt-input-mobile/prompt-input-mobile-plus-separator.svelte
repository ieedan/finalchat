<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof DropdownMenu.Separator> = $props();
</script>

<DropdownMenu.Separator bind:ref class={cn('', className)} {...restProps} />
