<script lang="ts" module>
	import { Context } from 'runed';

	type PlusStateProps = WritableBoxedValues<{
		open: boolean;
	}>;

	type PlusState = {
		open: boolean;
	};

	const PlusCtx = new Context<PlusState>('prompt-input-mobile-plus-ctx');

	function setupPlusState(props: PlusStateProps) {
		return PlusCtx.set({
			get open() {
				return props.open.current;
			},
			set open(open: boolean) {
				props.open.current = open;
			}
		});
	}

	export function usePlusState() {
		return PlusCtx.get();
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import PlusIcon from 'remixicon-svelte/icons/add-line';
	import { buttonVariants } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';
	import { box, type WritableBoxedValues } from 'svelte-toolbelt';

	let {
		open = $bindable(false),
		class: className,
		children
	}: { open?: boolean; class?: string; children: Snippet } = $props();

	const plusState = setupPlusState({
		open: box.with(
			() => open,
			(v) => (open = v)
		)
	});
</script>

<DropdownMenu.Root bind:open={plusState.open}>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'size-12 rounded-4xl [&_svg]:size-5! z-20',
			className
		)}
	>
		<PlusIcon />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" sideOffset={5} class="rounded-3xl p-2 min-w-[250px]">
		{@render children?.()}
	</DropdownMenu.Content>
</DropdownMenu.Root>
