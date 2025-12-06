<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { box } from 'svelte-toolbelt';
	import type { Model } from '../types';
	import { useModelPicker } from './prompt-input/prompt-input.svelte.js';
	import { BASIC_MODELS } from '$lib/ai.js';

	type Props = {
		models?: Model[];
	};

	let { models = BASIC_MODELS }: Props = $props();

	const modelPickerState = useModelPicker({
		models: box.with(() => models)
	});

	const selectedModel = $derived(
		models.find((model) => model.id === modelPickerState.rootState.opts.modelId.current)
	);
</script>

<Select.Root
	type="single"
	bind:value={
		() => modelPickerState.rootState.opts.modelId.current ?? models[0].id,
		(v) => (modelPickerState.rootState.opts.modelId.current = v)
	}
>
	<Select.Trigger>
		{selectedModel?.name}
	</Select.Trigger>
	<Select.Content align="start">
		{#each models as model (model.id)}
			<Select.Item value={model.id}>
				{model.name}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
