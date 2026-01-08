<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { PlusIcon } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
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
    <DropdownMenu.Content align="start" sideOffset={5} class="rounded-4xl">
        {@render children?.()}
    </DropdownMenu.Content>
</DropdownMenu.Root>
