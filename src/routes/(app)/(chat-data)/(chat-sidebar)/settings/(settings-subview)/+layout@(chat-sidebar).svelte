<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { RiArrowLeftLine } from 'remixicon-svelte';

	let { children } = $props();
</script>

<div class="flex flex-col h-full place-items-center">
	<div class={cn('sticky z-20 top-0 w-full h-14')}>
		<div class="px-3 py-2.5 w-full flex gap-4 items-center bg-background justify-between h-14">
			<div class="flex items-center gap-4 min-w-0 flex-1">
				<Button href="/settings" variant="ghost" size="icon">
					<RiArrowLeftLine />
				</Button>
			</div>
		</div>
	</div>
	<div class="w-full max-w-3xl flex flex-col py-0 settings:py-4 gap-2 place-items-center px-4">
		{@render children()}
	</div>
</div>
