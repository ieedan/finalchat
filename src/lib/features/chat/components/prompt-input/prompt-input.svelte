<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInput } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';

	let {
		class: className,
		children,
		onSubmit,
		submitOnEnter = false,
		value = $bindable(''),
		...rest
	}: HTMLAttributes<HTMLDivElement> & {
		onSubmit: (input: string) => Promise<void>;
		/**
		 * Whether to submit the form on enter. Otherwise the form will be submitted on shift+enter.
		 */
		submitOnEnter?: boolean;
		value?: string;
	} = $props();

	usePromptInput({
		onSubmit: box.with(() => onSubmit),
		submitOnEnter: box.with(() => submitOnEnter),
		value: box.with(
			() => value,
			(v) => (value = v)
		)
	});
</script>

<div
	class={cn(
		'rounded-lg border border-border flex flex-col transition-all ring-ring focus-within:ring-2 ring-offset-2 ring-offset-background',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
