<script lang="ts">
	import { box } from 'svelte-toolbelt';
	import type { Model, ModelId } from '../types';
	import { useModelPicker } from './prompt-input/prompt-input.svelte.js';
	import { ADVANCED_MODELS } from '$lib/ai.js';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';

	type Props = {
		models?: Model[];
	};

	let { models = ADVANCED_MODELS }: Props = $props();

	const modelPickerState = useModelPicker({
		models: box.with(() => models)
	});

	const selectedModel = $derived(
		models.find((model) => model.id === modelPickerState.rootState.opts.modelId.current)
	);

	let mode = $state<'list' | 'grid'>('list');

	let open = $state(false);

	function handleSelect(modelId: ModelId) {
		modelPickerState.rootState.opts.modelId.current = modelId;
		open = false;
	}

	let internalModelId = $derived<ModelId | undefined>(selectedModel?.id);
</script>

<Popover.Root bind:open>
	<Popover.Trigger class={buttonVariants({ variant: 'input' })}>
		<span>{selectedModel?.name}</span>
		<ChevronDownIcon class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="p-0 w-fit" align="start" animated={false}>
		<Command.Root bind:value={internalModelId}>
			<Command.Input placeholder="Search models..." />
			{#if mode === 'list'}
				<Command.List class="max-h-[128px]">
					<Command.Group>
						{#each models as model (model.id)}
							<Command.Item
								class="flex items-center justify-between gap-4"
								value={model.id}
								onSelect={() => handleSelect(model.id)}
							>
								<div class="flex items-center gap-2">
									<span>{model.name}</span>
									<div>
										{#if model.id === selectedModel?.id}
											<CheckIcon class="size-4" />
										{/if}
									</div>
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>
