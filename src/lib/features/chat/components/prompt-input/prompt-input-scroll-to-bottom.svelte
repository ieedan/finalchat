<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button, type ButtonElementProps } from '$lib/components/ui/button';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { animated } from 'animated-svelte';

	type Props = {
		isNearBottom: boolean;
		scrollToBottom: () => void;
	};

	let { isNearBottom, scrollToBottom }: ButtonElementProps & Props = $props();
</script>

{#if !isNearBottom}
	<animated.div
		class={cn(
			'absolute left-1/2 -translate-x-1/2',
			// handle the banner being open or closed
			'-top-9 group-has-[[data-slot="prompt-input-banner"][data-state="open"]]/prompt-input:-top-18'
		)}
		initial={{ y: 10, scale: 0.98, opacity: 0, filter: 'blur(2px)' }}
		animate={{
			y: 0,
			scale: 1,
			opacity: 1,
			filter: 'blur(0px)',
			transition: { duration: 0.15, timingFunction: 'ease-out', delay: 0.5 }
		}}
		exit={{
			y: 10,
			scale: 0.98,
			opacity: 0,
			filter: 'blur(2px)',
			transition: { duration: 0.15, timingFunction: 'ease-out', delay: 0 }
		}}
	>
		<Button
			variant="secondary"
			size="sm"
			onclick={() => scrollToBottom()}
			class="hover:bg-secondary"
		>
			Scroll to bottom
			<ChevronDownIcon class="size-4" />
		</Button>
	</animated.div>
{/if}
