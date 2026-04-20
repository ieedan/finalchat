<script lang="ts">
	import { Button, type ButtonElementProps } from '$lib/components/ui/button';
	import * as SplitButton from '$lib/components/ui/split-button';
	import { cn } from '$lib/utils';
	import {
		RiSendPlaneLine as SendIcon,
		RiStopLargeLine as StopIcon,
		RiArrowDownSLine as ChevronDownIcon
	} from 'remixicon-svelte';
	import { usePromptInputSubmit } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import type { Snippet } from 'svelte';

	type Props = Omit<ButtonElementProps, 'loading' | 'children'> & {
		children?: Snippet<[{ submit: () => Promise<void> }]>;
		menuAriaLabel?: string;
	};

	let {
		variant = 'default',
		class: className,
		disabled,
		onclick,
		children,
		menuAriaLabel = 'More send options',
		...rest
	}: Props = $props();

	const submitState = usePromptInputSubmit({
		disabled: box.with(() => disabled),
		onclick: box.with(() => onclick)
	});

	async function submit() {
		await submitState.rootState.submit(submitState.rootState.opts.value.current);
	}
</script>

<SplitButton.Root>
	<Button
		{variant}
		size="icon"
		class={cn('group relative rounded-r-none data-[generating=true]:animate-pulse', className)}
		{...submitState.props}
		{...rest}
	>
		{#if submitState.generating}
			<StopIcon />
		{:else if !submitState.rootState.loading}
			<SendIcon class="group-data-[loading=true]:hidden" />
		{/if}
	</Button>
	<SplitButton.Trigger
		{variant}
		size="icon"
		disabled={submitState.rootState.loading || submitState.generating}
		aria-label={menuAriaLabel}
	>
		<ChevronDownIcon />
	</SplitButton.Trigger>
	<SplitButton.Content align="end" side="top">
		{@render children?.({ submit })}
	</SplitButton.Content>
</SplitButton.Root>
