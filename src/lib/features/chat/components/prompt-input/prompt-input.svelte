<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInput, type OnSubmit } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import PromptInputBannerContent from './prompt-input-banner-content.svelte';
	import PromptInputBanner from './prompt-input-banner.svelte';
	import PromptInputBannerDismiss from './prompt-input-banner-dismiss.svelte';
	import type { ModelId } from '../../types.js';

	let {
		class: className,
		children,
		onSubmit,
		submitOnEnter = false,
		optimisticClear = true,
		value = $bindable(''),
		modelId = $bindable(null),
		generating = false,
		...rest
	}: HTMLAttributes<HTMLDivElement> & {
		onSubmit: OnSubmit;
		generating?: boolean;
		/**
		 * Whether to submit the form on enter. Otherwise the form will be submitted on shift+enter.
		 */
		submitOnEnter?: boolean;
		optimisticClear?: boolean;
		value?: string;
		modelId?: ModelId | null;
	} = $props();

	const promptInputState = usePromptInput({
		onSubmit: box.with(() => onSubmit),
		submitOnEnter: box.with(() => submitOnEnter),
		generating: box.with(() => generating),
		value: box.with(
			() => value,
			(v) => (value = v)
		),
		optimisticClear: box.with(() => optimisticClear),
		modelId: box.with(
			() => modelId,
			(v) => (modelId = v)
		)
	});
</script>

<div class={cn('relative', className)} {...rest}>
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
