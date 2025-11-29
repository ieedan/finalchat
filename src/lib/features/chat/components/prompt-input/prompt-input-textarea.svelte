<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { TextareaAutosize } from 'runed';
	import { usePromptInputTextarea } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';

	let {
		ref = $bindable(null),
		autofocus = true,
		maxHeight = 200,
		class: className,
		onkeydown,
		...rest
	}: Omit<WithElementRef<HTMLTextareaAttributes>, 'value'> & {
		maxHeight?: number;
	} = $props();

	const textareaState = usePromptInputTextarea({
		onkeydown: box.with(() => onkeydown)
	});

	new TextareaAutosize({
		element: () => ref!,
		input: () => textareaState.rootState.opts.value.current,
		maxHeight
	});
</script>

<!-- svelte-ignore a11y_autofocus -->
<textarea
	bind:value={textareaState.rootState.opts.value.current}
	bind:this={ref}
	class={cn(
		'p-3 outline-none resize-none disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	style="height: 48px;"
	{autofocus}
	{...textareaState.props}
	{...rest}
></textarea>
