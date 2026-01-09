<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import PromptInputBanner from './prompt-input-mobile-banner.svelte';
	import PromptInputBannerContent from './prompt-input-banner-content.svelte';
	import PromptInputBannerDismiss from './prompt-input-mobile-banner-dismiss.svelte';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import { PromptInputCtx } from '../prompt-input/prompt-input.svelte.js';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();

	const promptInputState = PromptInputCtx.get();
</script>

<div
	class={cn('flex-1 w-full relative flex flex-col items-center justify-center z-10', className)}
	{...rest}
>
	<PromptInputBanner
		dismissed={promptInputState.error === null}
		dismissedByError={false}
		onDismiss={() => (promptInputState.error = null)}
	>
		<PromptInputBannerContent>
			<div class="flex items-center gap-1.5 relative min-w-0">
				<AlertCircleIcon class="size-4 text-destructive shrink-0" />
				<span class="text-sm text-destructive truncate min-w-0">{promptInputState.error}</span>
			</div>
			<PromptInputBannerDismiss />
		</PromptInputBannerContent>
	</PromptInputBanner>
	{@render children?.()}
</div>
