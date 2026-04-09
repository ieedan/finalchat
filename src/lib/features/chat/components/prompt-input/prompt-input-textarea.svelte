<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { TextareaAutosize } from 'runed';
	import { usePromptInputTextarea } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';

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

<FileDropZone.Textarea>
	{#snippet child({ props: textareaProps })}
		<!-- svelte-ignore a11y_autofocus -->
		<textarea
			bind:value={textareaState.rootState.opts.value.current}
			bind:this={ref}
			class={cn(
				'min-h-12 md:min-h-16 p-3 outline-none resize-none disabled:cursor-not-allowed disabled:opacity-50',
				className
			)}
			{autofocus}
			{...textareaProps}
			{...textareaState.props}
			{...rest}
		></textarea>
	{/snippet}
</FileDropZone.Textarea>
