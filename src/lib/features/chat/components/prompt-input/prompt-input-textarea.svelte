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
		onpaste,
		...rest
	}: Omit<WithElementRef<HTMLTextareaAttributes, HTMLTextAreaElement>, 'value'> & {
		maxHeight?: number;
	} = $props();

	const textareaState = usePromptInputTextarea({
		onkeydown: box.with(() => onkeydown),
		onpaste: box.with(() => onpaste),
		ref: box.with(() => ref)
	});

	new TextareaAutosize({
		element: () => ref!,
		input: () => textareaState.rootState.opts.value.current,
		// svelte-ignore state_referenced_locally
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
