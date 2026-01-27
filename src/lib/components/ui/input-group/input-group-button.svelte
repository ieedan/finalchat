<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		ref = $bindable(null),
		class: className,
		...props
	}: ComponentProps<typeof Button> = $props();
</script>

<Button
	bind:ref
	data-slot="input-group-button"
	class={cn('rounded-none border-0 shadow-none', className)}
	{...props}
/>
