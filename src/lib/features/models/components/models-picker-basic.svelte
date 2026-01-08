<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { box } from 'svelte-toolbelt';
	import type { Model } from '$lib/features/chat/types';
	import { useModelPicker } from '$lib/features/chat/components/prompt-input/prompt-input.svelte.js';
	import { BASIC_MODELS } from '$lib/ai.js';
	import { shortcut } from '$lib/actions/shortcut.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';

	type Props = {
		models?: Model[];
		animated?: boolean;
	};

	let { models = BASIC_MODELS, animated = false }: Props = $props();

	const isMobile = new IsMobile();

	const modelPickerState = useModelPicker({
		models: box.with(() => models)
	});

	const selectedModel = $derived(
		models.find((model) => model.id === modelPickerState.rootState.opts.modelId.current) ??
			models[0]
	);

	let open = $state(false);
</script>

<svelte:window
	use:shortcut={{ key: 'm', shift: true, ctrl: true, callback: () => (open = !open) }}
/>

{#if isMobile.current}
	<NativeSelect.Root
		bind:value={modelPickerState.rootState.opts.modelId.current}
		class={cn(buttonVariants({ variant: 'input' }), 'max-w-[175px] md:max-w-none')}
	>
		{#each models as model (model.id)}
			<NativeSelect.Option value={model.id}>{model.name}</NativeSelect.Option>
		{/each}
	</NativeSelect.Root>
{:else}
	<Select.Root
		type="single"
		bind:open
		bind:value={
			() => modelPickerState.rootState.opts.modelId.current ?? models[0].id,
			(v) => (modelPickerState.rootState.opts.modelId.current = v)
		}
		onValueChange={() => modelPickerState.onSelect()}
	>
		<Select.Trigger>
			{selectedModel.name}
		</Select.Trigger>
		<Select.Content align="start" {animated} side="top">
			{#each models as model (model.id)}
				<Select.Item value={model.id}>
					{model.name}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
{/if}
