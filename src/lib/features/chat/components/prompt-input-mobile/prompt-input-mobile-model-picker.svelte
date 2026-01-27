<script lang="ts">
	import { box } from 'svelte-toolbelt';
	import type { Model } from '$lib/features/chat/types';
	import { useModelPicker } from '$lib/features/chat/components/prompt-input/prompt-input.svelte.js';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import { cn } from '$lib/utils';
	import { RiSparklingLine as SparklesIcon } from 'remixicon-svelte';
	import { usePlusState } from './prompt-input-mobile-plus.svelte';

	type Props = {
		models: Model[];
	};

	let { models }: Props = $props();

	const modelPickerState = useModelPicker({
		models: box.with(() => models)
	});

	const plusState = usePlusState();
</script>

<NativeSelect.Root
	bind:value={modelPickerState.rootState.opts.modelId.current}
	class={cn(
		'border-none w-full focus-visible:ring-0 h-10',
		"hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/20 data-[variant=destructive]:hover:text-destructive data-[variant=destructive]:*:[svg]:text-destructive! [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex cursor-default select-none items-center gap-2 rounded-2xl px-2 py-1.5 text-sm data-disabled:pointer-events-none data-inset:ps-8 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		'py-2.5'
	)}
	onchange={() => {
		plusState.open = false;
	}}
	groupClassName="w-full"
	hideIcon
>
	{#snippet icon()}
		<SparklesIcon class="size-4" />
	{/snippet}
	{#each models as model (model.id)}
		<NativeSelect.Option value={model.id}>
			{model.name}
		</NativeSelect.Option>
	{/each}
</NativeSelect.Root>
