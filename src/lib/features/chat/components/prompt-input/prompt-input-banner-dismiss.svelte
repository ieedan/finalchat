<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { usePromptInputBannerDismiss } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import { cn } from '$lib/utils';
	import { RiCloseLine as XIcon } from 'remixicon-svelte';

	let {
		class: className,
		onclick,
		...rest
	}: Omit<HTMLButtonAttributes, 'type' | 'children'> = $props();

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
