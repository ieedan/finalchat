<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { RiLoader2Line as LoaderIcon } from 'remixicon-svelte';
	import type { ComponentProps } from 'svelte';

	let { class: className, ...restProps }: ComponentProps<typeof LoaderIcon> = $props();
</script>

<LoaderIcon
	role="status"
	aria-label="Loading"
	class={cn('size-4 animate-spin shrink-0', className)}
	{...restProps}
/>
