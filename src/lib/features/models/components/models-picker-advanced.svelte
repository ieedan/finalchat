<script lang="ts">
	import { box } from 'svelte-toolbelt';
	import type { ModelId } from '$lib/features/chat/types';
	import { useModelPicker } from '$lib/features/chat/components/prompt-input/prompt-input.svelte.js';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { useChatLayout } from '$lib/features/chat/chat.svelte.js';
	import * as Kbd from '$lib/components/ui/kbd';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
	import { supportsImages, supportsReasoning, type Model } from '../openrouter';
	import ImageIcon from '@lucide/svelte/icons/image';
	import BrainIcon from '@lucide/svelte/icons/brain';
	import { cn } from '$lib/utils';
	import GridIcon from '@lucide/svelte/icons/grid';
	import StarIcon from '@lucide/svelte/icons/star';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	const chatLayoutState = useChatLayout();

	const modelPickerState = useModelPicker({
		models: box.with(() => chatLayoutState.models)
	});

	const selectedModel = $derived(
		chatLayoutState.models.find(
			(model) => model.id === modelPickerState.rootState.opts.modelId.current
		)
	);

	let mode = $state<'list' | 'grid'>('list');

	let open = $state(false);

	function handleSelect(modelId: ModelId) {
		modelPickerState.rootState.opts.modelId.current = modelId;
		open = false;
	}

	let internalModelId = $derived<ModelId | undefined>(selectedModel?.id);

	const modelsByLab = $derived(groupModelsByLab(chatLayoutState.models));

	function groupModelsByLab(models: (Model & { lab: string | null })[]) {
		return models.reduce(
			(acc, model) => {
				const lab = model.lab ?? 'Unknown';
				acc[lab] = acc[lab] || [];
				acc[lab].push(model);
				return acc;
			},
			{} as Record<string, (Model & { lab: string | null })[]>
		);
	}

	const isMobile = new IsMobile();

	const gridMode = $derived(!isMobile.current && mode === 'grid');
</script>

<Popover.Root bind:open>
	<Popover.Trigger class={buttonVariants({ variant: 'input' })}>
		<span>{selectedModel?.name}</span>
		<ChevronDownIcon class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="p-0 w-fit" align="start" animated={false} side="top">
		<Command.Root bind:value={internalModelId} columns={mode === 'list' ? undefined : 5}>
			<Command.Input
				placeholder="Search models..."
				onkeydown={(e) => {
					if (e.metaKey && e.key === 'ArrowRight') {
						e.preventDefault();
						mode = 'grid';
					} else if (e.metaKey && e.key === 'ArrowLeft') {
						e.preventDefault();
						mode = 'list';
					}
				}}
			/>
			<Command.List
				class={cn(
					'h-[136px] md:w-[300px] transition-[height,width]',
					mode === 'grid' && 'h-[350px] md:w-[408px] lg:w-[682px]'
				)}
			>
				{#if !gridMode}
					<Command.Group>
						{#each chatLayoutState.enabledModels as model (model.id)}
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
								<div class="flex items-center gap-1.5">
									{#if supportsImages(model)}
										<ImageIcon class="size-3.5 text-muted-foreground/50" />
									{/if}
									{#if supportsReasoning(model)}
										<BrainIcon class="size-3.5 text-muted-foreground/50" />
									{/if}
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				{:else}
					{#each Object.entries(modelsByLab).sort( (a, b) => a[0].localeCompare(b[0]) ) as [lab, models]}
						<Command.Group
							heading={lab}
							class={cn(
								'**:data-[slot=command-group-items]:grid **:data-[slot=command-group-items]:gap-2',
								'md:**:data-[slot=command-group-items]:grid-cols-3',
								'lg:**:data-[slot=command-group-items]:grid-cols-5'
							)}
						>
							{#each models as model (model.id)}
								<Command.Item
									class="flex items-center justify-center border border-border rounded-md gap-4 size-32"
									value={model.id}
									onSelect={() => handleSelect(model.id)}
								>
									<div class="flex flex-col gap-2 items-center">
										<span class="text-center">{model.name}</span>
										<div class="flex items-center gap-1.5">
											{#if supportsImages(model)}
												<ImageIcon class="size-3.5 text-muted-foreground/50" />
											{/if}
											{#if supportsReasoning(model)}
												<BrainIcon class="size-3.5 text-muted-foreground/50" />
											{/if}
										</div>
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
					{/each}
				{/if}
			</Command.List>
		</Command.Root>
		{#if !isMobile.current}
			<div class="flex items-center gap-2 border-t p-1">
				<Button
					variant="ghost"
					size="sm"
					onclick={() => (mode = mode === 'list' ? 'grid' : 'list')}
				>
					<span class="text-sm flex items-center gap-1.5">
						{#if gridMode}
							<StarIcon class="size-3.5 inline shrink-0" />
							Favorites
						{:else}
							<GridIcon class="size-3.5 inline shrink-0" />
							All models
						{/if}
					</span>
					<Kbd.Group class="**:data-[slot=kbd]:border">
						<Kbd.Root>{cmdOrCtrl}</Kbd.Root>
						<Kbd.Root>{gridMode ? '←' : '→'}</Kbd.Root>
					</Kbd.Group>
				</Button>
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
