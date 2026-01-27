<script lang="ts">
	import { Button, type ButtonElementProps } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { RiSendPlaneLine as SendIcon } from 'remixicon-svelte';
	import { usePromptInputSubmit } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';

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

<Button
	{variant}
	{size}
	class={cn('group relative data-[generating=true]:animate-pulse', className)}
	{...submitState.props}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else if !submitState.rootState.loading}
		<SendIcon class="group-data-[loading=true]:hidden" />
	{/if}
</Button>
