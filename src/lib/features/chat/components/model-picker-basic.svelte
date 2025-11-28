<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { Model, ModelId } from '../types';

	type Props = {
		value: ModelId;
		models: Model[];
	};

	let { models, value = $bindable() }: Props = $props();

	const selectedModel = $derived(models.find((model) => model.id === value));
</script>

<Select.Root type="single" bind:value>
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
