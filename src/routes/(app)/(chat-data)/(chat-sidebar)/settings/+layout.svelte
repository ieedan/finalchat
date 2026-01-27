<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { setupSettingsLayout } from '$lib/features/settings/settings.svelte';
	import { ScrollState } from 'runed';
	import { animated } from 'animated-svelte';
	import { cn } from '$lib/utils';

	let { children } = $props();

	const sidebar = useSidebar();

	setupSettingsLayout();

	const scrollState = new ScrollState({
		element: () => window
	});
</script>

<div class="flex flex-col h-full place-items-center">
	{#if sidebar.isMobile || !sidebar.open}{/if}
	<div
		class={cn('sticky z-20 top-0 h-0 w-full transition-[height]', {
			'h-14 settings:h-0 [--height:3.5rem] settings:[--height:0]': sidebar.isMobile || !sidebar.open
		})}
	>
		<div class="relative h-(--height) top-0">
			<div class="absolute z-20 h-(--height) bg-background mask-b-from-25% top-0 w-full"></div>
			<div class={cn('hidden', { 'flex settings:hidden': sidebar.isMobile || !sidebar.open })}>
				{#if scrollState.y > 15}
					<animated.span
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2, timingFunction: 'ease-out' }}
						class="absolute z-30 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-medium"
					>
						Settings
					</animated.span>
				{/if}
			</div>
		</div>
	</div>

	<div class="w-full max-w-3xl flex flex-col py-0 settings:py-4 gap-2 place-items-center px-4">
		{@render children()}
	</div>
</div>
