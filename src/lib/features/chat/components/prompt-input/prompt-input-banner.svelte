<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInputBanner } from './prompt-input.svelte.js';
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
		'ease-in-out border bg-sidebar -translate-y-8 rounded-lg h-full absolute z-0 w-full flex items-start justify-between gap-4 px-3 duration-150',
		{
			'translate-y-0': dismissed || (dismissedByError && bannerState.rootState.error !== null)
		}
	)}
	{...rest}
>
	{@render children?.()}
</div>
