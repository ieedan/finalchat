<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInput } from './prompt-input.svelte.js';
	import { box } from 'svelte-toolbelt';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import XIcon from '@lucide/svelte/icons/x';

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

	const promptInputState = usePromptInput({
		onSubmit: box.with(() => onSubmit),
		submitOnEnter: box.with(() => submitOnEnter),
		value: box.with(
			() => value,
			(v) => (value = v)
		)
	});
</script>

<div class="relative">
	<div
		class={cn(
			'ease-in-out border bg-sidebar rounded-lg h-full absolute z-0 w-full flex items-start justify-between gap-4 px-3 duration-150',
			{
				'-translate-y-8': promptInputState.error !== null
			}
		)}
	>
		<div class="flex items-center justify-between w-full py-1.5">
			<div class="flex items-center gap-1.5">
				<AlertCircleIcon
					class={cn('size-4 text-destructive', {
						hidden: promptInputState.error === null
					})}
				/>
				<span class="text-sm text-destructive">{promptInputState.error}</span>
			</div>
			<button
				type="button"
				class="text-muted-foreground cursor-pointer size-5 flex items-center justify-center"
				onclick={() => (promptInputState.error = null)}
			>
				<XIcon class="size-4" />
			</button>
		</div>
	</div>
	<div
		class={cn(
			'rounded-lg relative z-10 border bg-background flex flex-col',
			className
		)}
		{...rest}
	>
		{@render children?.()}
	</div>
</div>
