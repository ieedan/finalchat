<!-- Incredible work https://animation-svelte.vercel.app/magic/animated-shiny-text thank you! -->

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		shimmerWidth?: number;
		class?: string;
		children?: Snippet<[]>;
	};

	let { shimmerWidth = 100, class: className = '', children }: Props = $props();
</script>

<p
	style:--shimmer-width="{shimmerWidth}px"
	class={cn(
		'w-fit text-neutral-600/50 dark:text-neutral-400/50 ',

		// Shimmer effect
		'animate-shimmer bg-clip-text bg-no-repeat bg-position-[0_0] bg-size-[var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',

		// Shimmer gradient
		'bg-linear-to-r from-transparent via-black/80 via-50% to-transparent  dark:via-white/80',

		className
	)}
>
	{@render children?.()}
</p>
