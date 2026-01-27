<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { RiArrowLeftLine } from 'remixicon-svelte';
	import { useSidebar } from '$lib/components/ui/sidebar';

	const sidebar = useSidebar();

	let { children } = $props();
</script>

<div class="flex flex-col h-full place-items-center">
	<div
		class={cn('sticky z-20 top-0 w-full h-14 xl:h-0', {
			'lg:h-0 h-14': !sidebar.open
		})}
	>
		<div class="px-3 py-2.5 w-full flex gap-4 items-center justify-between h-14">
			<div class="flex items-center gap-4 min-w-0 flex-1">
				<Button href="/settings" variant="ghost" size="icon">
					<RiArrowLeftLine />
				</Button>
			</div>
		</div>
	</div>
	<div class="w-full max-w-3xl flex flex-col settings:py-4 py-0 gap-2 place-items-center px-4">
		{@render children()}
	</div>
</div>
