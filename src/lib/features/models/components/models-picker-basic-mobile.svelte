<script lang="ts">
	import { box } from 'svelte-toolbelt';
	import type { Model } from '$lib/features/chat/types';
	import { useModelPicker } from '$lib/features/chat/components/prompt-input/prompt-input.svelte.js';
	import { BASIC_MODELS } from '$lib/ai.js';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';

	type Props = {
		models?: Model[];
	};

	let { models = BASIC_MODELS }: Props = $props();

	const modelPickerState = useModelPicker({
		models: box.with(() => models)
	});
</script>

<NativeSelect.Root
	bind:value={modelPickerState.rootState.opts.modelId.current}
	class={cn(buttonVariants({ variant: 'input' }), 'max-w-[175px] md:max-w-none')}
>
	{#each models as model (model.id)}
		<NativeSelect.Option value={model.id}>{model.name}</NativeSelect.Option>
	{/each}
</NativeSelect.Root>
