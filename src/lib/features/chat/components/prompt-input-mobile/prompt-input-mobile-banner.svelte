<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInputBanner } from '../prompt-input/prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';

	let {
		class: className,
		children,
		dismissed = $bindable(false),
		dismissedByError = true,
		onDismiss,
		...rest
	}: HTMLAttributes<HTMLDivElement> & {
		dismissed?: boolean;
		dismissedByError?: boolean;
		onDismiss?: () => void;
	} = $props();

	const bannerState = usePromptInputBanner({
		onDismiss: box.with(() => onDismiss ?? (() => {}))
	});
</script>

<div
	data-slot="prompt-input-banner"
	data-state={dismissed || (dismissedByError && bannerState.rootState.error !== null)
		? 'closed'
		: 'open'}
	class={cn(
		'ease-in-out border bg-sidebar -translate-y-7.5 data-[state=closed]:rounded-b-4xl rounded-t-3xl data-[state=open]:h-13 absolute z-0 w-full flex items-start justify-between gap-4 px-4 duration-150',
		{
			'translate-y-0': dismissed || (dismissedByError && bannerState.rootState.error !== null)
		},
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
