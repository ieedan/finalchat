<script lang="ts">
	import { Button, type ButtonProps, type ButtonVariant } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils.js';
	import { RiArrowDownSLine as ChevronDownIcon } from 'remixicon-svelte';

	let {
		class: className,
		children,
		variant = 'default',
		size = 'icon',
		'aria-label': ariaLabel = 'Open menu',
		...rest
	}: ButtonProps & { variant?: ButtonVariant; 'aria-label'?: string } = $props();
</script>

<DropdownMenu.Trigger>
	{#snippet child({ props })}
		<Button
			data-slot="split-button-trigger"
			class={cn('rounded-l-none border-l border-l-black/10 dark:border-l-white/10', className)}
			{variant}
			{size}
			aria-label={ariaLabel}
			{...props}
			{...rest}
		>
			{#if children}
				{@render children()}
			{:else}
				<ChevronDownIcon />
			{/if}
		</Button>
	{/snippet}
</DropdownMenu.Trigger>
