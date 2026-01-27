<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Popover from '$lib/components/ui/popover';
	import MenuIcon from 'remixicon-svelte/icons/menu-line';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';

	let {
		children,
		class: className,
		title,
		...rest
	}: HTMLAttributes<HTMLDivElement> & { title?: string } = $props();

	let open = $state(false);
</script>

<div
	class={cn(
		'sticky top-0 z-10 h-14 w-full flex-row place-items-center gap-6 border-b px-4',
		'lg:static lg:col-start-1 lg:flex lg:h-full lg:w-(--sidebar-width) lg:flex-col lg:place-items-start lg:border-r lg:border-b-0 lg:px-6 lg:pt-4',
		className
	)}
	{...rest}
>
	<div class="flex h-full w-full place-items-center gap-4 lg:hidden">
		<Popover.Root bind:open>
			<Popover.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
				<MenuIcon />
			</Popover.Trigger>
			<Popover.Content
				align="start"
				class="p-2"
				onclick={(e) => {
					const target = e.target as HTMLElement;
					if (target.tagName === 'A') {
						open = false;
					}
				}}
			>
				{@render children?.()}
			</Popover.Content>
		</Popover.Root>
		<span class="text-2xl font-medium">
			{title}
		</span>
	</div>
	<div class="hidden lg:contents">
		{@render children?.()}
	</div>
</div>
