<script lang="ts">
	import { Button, type ButtonElementProps } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import SendIcon from '@lucide/svelte/icons/send';
	import { usePromptInputSubmit } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import SquareIcon from '@lucide/svelte/icons/square';

	let {
		variant = 'default',
		size = 'icon',
		class: className,
		children,
		disabled,
		onclick,
		...rest
	}: Omit<ButtonElementProps, 'loading'> = $props();

	const submitState = usePromptInputSubmit({
		disabled: box.with(() => disabled),
		onclick: box.with(() => onclick)
	});
</script>

<Button {variant} {size} class={cn('group relative data-[generating=true]:animate-pulse', className)} {...submitState.props} {...rest}>
	{#if children}
		{@render children()}
	{:else if submitState.rootState.opts.generating.current}
		<SquareIcon class="fill-current"/>
	{:else}
		<SendIcon class="group-data-[loading=true]:hidden" />
	{/if}
</Button>
