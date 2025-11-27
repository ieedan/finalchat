<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { usePromptInputBannerDismiss } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import { cn } from '$lib/utils';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		class: className,
		children,
		onclick,
		...rest
	}: Omit<HTMLButtonAttributes, 'type'> = $props();

	const dismissState = usePromptInputBannerDismiss({
		onclick: box.with(() => onclick)
	});
</script>

<button
	type="button"
	class={cn(
		'text-muted-foreground cursor-pointer size-5 flex items-center justify-center',
		className
	)}
	{...dismissState.props}
	{...rest}
>
	<XIcon class="size-4" />
</button>
