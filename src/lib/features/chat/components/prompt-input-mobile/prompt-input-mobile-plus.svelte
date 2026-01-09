<script lang="ts">
	import { cn } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { PlusIcon } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';

	let { class: className, children }: { open?: boolean; class?: string; children: Snippet } =
		$props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'size-12 rounded-full [&_svg]:size-5!',
			className
		)}
	>
		<PlusIcon />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" sideOffset={5}>
		{@render children?.()}
	</DropdownMenu.Content>
</DropdownMenu.Root>
