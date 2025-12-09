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
	import {
		costPerMillionTokens,
		supportsImages,
		supportsReasoning,
		type Model
	} from '../openrouter';
	import ImageIcon from '@lucide/svelte/icons/image';
	import BrainIcon from '@lucide/svelte/icons/brain';
	import { cn } from '$lib/utils';
	import GridIcon from '@lucide/svelte/icons/grid';
	import StarIcon from '@lucide/svelte/icons/star';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { LABS, type Lab } from '../labs';
	import { shortcut } from '$lib/actions/shortcut.svelte';
	import fuzzysort from 'fuzzysort';
	import { Debounced } from 'runed';
	import ClipboardIcon from '@lucide/svelte/icons/clipboard';
	import StarOffIcon from '@lucide/svelte/icons/star-off';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { Separator } from '$lib/components/ui/separator';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
	import { toast } from 'svelte-sonner';
	import { formatNumberShort } from '$lib/utils/number-format';

	type Props = {
		animated?: boolean;
	};

	let { animated = false }: Props = $props();

	const chatLayoutState = useChatLayout();

	const modelPickerState = useModelPicker({
		models: box.with(() => chatLayoutState.models)
	});

	let search = $state('');

	const searchDebounced = new Debounced(() => search, 0);

	const sortedModels = $derived(
		searchDebounced.current.trim()
			? fuzzysort
					.go(searchDebounced.current, chatLayoutState.models, {
						keys: ['name', 'lab.name', 'description', 'id'],
						threshold: 0.5
					})
					.map((result) => result.obj)
			: chatLayoutState.models
	);

	const selectedModel = $derived(
		sortedModels.find((model) => model.id === modelPickerState.rootState.opts.modelId.current)
	);

	let mode = $state<'list' | 'grid'>('list');

	let open = $state(false);

	function handleSelect(modelId: ModelId) {
		modelPickerState.rootState.opts.modelId.current = modelId;
		open = false;
		modelPickerState.onSelect();
	}

	let internalModelId = $derived<ModelId | undefined>(selectedModel?.id);

	const modelsByLab = $derived(groupModelsByLab(sortedModels));

	function groupModelsByLab(models: (Model & { lab: string | null })[]) {
		const grouped = models.reduce(
			(acc, model) => {
				if (!model.lab) return acc;

				const lab = LABS.find((lab) => lab.name.toLowerCase() === model.lab?.toLowerCase());

				if (!lab) return acc;

				acc[lab.name] = acc[lab.name] || [];
				acc[lab.name].push({ ...model, lab });
				return acc;
			},
			{} as Record<string, (Model & { lab: Lab })[]>
		);

		if (searchDebounced.current.trim() === '')
			return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

		return Object.entries(grouped);
	}

	const isMobile = new IsMobile();

	const gridMode = $derived(!isMobile.current && mode === 'grid');

	const activeModel = $derived(sortedModels.find((model) => model.id === internalModelId));

	const client = useConvexClient();

	async function handleRemoveFromFavorites(modelId: ModelId) {
		await client.mutation(api.userSettings.removeFavoriteModel, {
			modelId
		});
	}

	async function handleAddToFavorites(modelId: ModelId) {
		await client.mutation(api.userSettings.addFavoriteModel, {
			modelId
		});
	}

	async function handleToggleFavorite(modelId: ModelId) {
		if (chatLayoutState.userSettings?.favoriteModelIds?.includes(modelId)) {
			await handleRemoveFromFavorites(modelId);
		} else {
			await handleAddToFavorites(modelId);
		}
	}

	let actionsMenuOpen = $state(false);

	const modelIdClipboard = new UseClipboard();
</script>

<svelte:window
	use:shortcut={{ key: 'm', shift: true, ctrl: true, callback: () => (open = !open) }}
/>

<Popover.Root
	bind:open
	onOpenChange={() => {
		search = '';
		mode = 'list';
		actionsMenuOpen = false;
	}}
>
	<Popover.Trigger class={buttonVariants({ variant: 'input' })}>
		<span>{selectedModel?.name}</span>
		<ChevronDownIcon class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="p-0 w-fit" align="start" {animated} side="top">
		<Command.Root
			bind:value={internalModelId}
			columns={mode === 'list' ? undefined : 5}
			shouldFilter={false}
		>
			<Command.Input
				placeholder="Search models..."
				bind:value={search}
				onkeydown={(e) => {
					if (e.metaKey && e.key === 'ArrowRight') {
						e.preventDefault();
						mode = 'grid';
					} else if (e.metaKey && e.key === 'ArrowLeft') {
						e.preventDefault();
						mode = 'list';
					} else if (e.metaKey && e.key === 'u') {
						e.preventDefault();
						if (internalModelId) {
							handleToggleFavorite(internalModelId);
						}
					} else if (e.metaKey && e.key === 'k') {
						e.preventDefault();
						actionsMenuOpen = !actionsMenuOpen;
					} else if (e.key === 'Backspace' && search === '' && mode === 'grid') {
						e.preventDefault();
						mode = 'list';
					}
				}}
			/>
			<Command.List
				class={cn(
					'h-[136px] max-h-none md:w-[300px]',
					animated && 'transition-[height,width]',
					mode === 'grid' && 'h-[498px] md:w-[416px] lg:w-[688px]'
				)}
			>
				<Command.Empty>No models found.</Command.Empty>
				{#if !gridMode}
					<Command.Group>
						{#each sortedModels.filter( (model) => chatLayoutState.userSettings?.favoriteModelIds?.includes(model.id) ) as model (model.id)}
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
					{#each modelsByLab as [lab, models]}
						<Command.Group
							heading={lab}
							class={cn(
								'px-2',
								'**:data-[slot=command-group-items]:grid **:data-[slot=command-group-items]:gap-2',
								'md:**:data-[slot=command-group-items]:grid-cols-3',
								'lg:**:data-[slot=command-group-items]:grid-cols-5'
							)}
						>
							{#each models as model (model.id)}
								{@const isFavorite = chatLayoutState.userSettings?.favoriteModelIds?.includes(
									model.id
								)}
								<Command.Item
									class="flex items-center justify-center relative border border-border rounded-md gap-4 size-32"
									value={model.id}
									onSelect={() => handleSelect(model.id)}
								>
									<div class="flex flex-col gap-2 items-center">
										{#if lab}
											<model.lab.logo class="size-8" />
										{/if}
										<div class="h-10 flex items-center justify-center">
											<span class="text-center line-clamp-2">
												{model.name}
											</span>
										</div>
										<div class="flex items-center gap-1.5 h-3.5">
											{#if supportsImages(model)}
												<ImageIcon class="size-3.5 text-muted-foreground/50" />
											{/if}
											{#if supportsReasoning(model)}
												<BrainIcon class="size-3.5 text-muted-foreground/50" />
											{/if}
										</div>
									</div>
									<div class="absolute top-2 right-2">
										{#if isFavorite}
											<StarIcon class="size-3.5 text-yellow-500 fill-yellow-500" />
										{/if}
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
					{/each}
				{/if}
			</Command.List>
		</Command.Root>
		{#if !isMobile.current}
			<div class="flex items-center justify-between gap-2 border-t p-1">
				<div>
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
				{#if gridMode}
					<div class="flex items-center gap-2">
						{#if activeModel}
							{@const isFavorite = chatLayoutState.userSettings?.favoriteModelIds?.includes(
								activeModel.id
							)}
							<Button
								variant="ghost"
								size="sm"
								onclick={() => handleToggleFavorite(activeModel.id)}
							>
								<span
									class={cn('text-sm flex items-center gap-1.5', isFavorite && 'text-destructive')}
								>
									{#if isFavorite}
										<StarOffIcon class="size-3.5 inline shrink-0" />
										Remove from favorites
									{:else}
										<StarIcon class="size-3.5 inline shrink-0" />
										Add to favorites
									{/if}
								</span>
								<Kbd.Group class="**:data-[slot=kbd]:border">
									<Kbd.Root>{cmdOrCtrl}</Kbd.Root>
									<Kbd.Root>U</Kbd.Root>
								</Kbd.Group>
							</Button>
							<Separator orientation="vertical" class="h-4!" />
							<DropdownMenu.Root bind:open={actionsMenuOpen}>
								<DropdownMenu.Trigger
									tabindex={-1}
									class={buttonVariants({ variant: 'ghost', size: 'sm' })}
								>
									<span> Actions </span>
									<Kbd.Group class="**:data-[slot=kbd]:border">
										<Kbd.Root>{cmdOrCtrl}</Kbd.Root>
										<Kbd.Root>K</Kbd.Root>
									</Kbd.Group>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" side="top" {animated}>
									<DropdownMenu.Group>
										<DropdownMenu.Item onSelect={() => handleToggleFavorite(activeModel.id)}>
											<span
												class={cn(
													'text-sm flex items-center gap-1.5',
													isFavorite && 'text-destructive'
												)}
											>
												{#if isFavorite}
													<StarOffIcon class="size-3.5 inline shrink-0" />
													Remove from favorites
												{:else}
													<StarIcon class="size-3.5 inline shrink-0" />
													Add to favorites
												{/if}
											</span>
											<Kbd.Group class="**:data-[slot=kbd]:border">
												<Kbd.Root>{cmdOrCtrl}</Kbd.Root>
												<Kbd.Root>U</Kbd.Root>
											</Kbd.Group>
										</DropdownMenu.Item>
									</DropdownMenu.Group>
									<DropdownMenu.Separator />
									<DropdownMenu.Group>
										<DropdownMenu.Item
											onSelect={() => {
												modelIdClipboard.copy(activeModel.id);
												toast.success(`Copied ${activeModel.id} to your clipboard!`);
											}}
										>
											<ClipboardIcon class="size-3.5 inline shrink-0" />
											Copy model ID
										</DropdownMenu.Item>
									</DropdownMenu.Group>
									<DropdownMenu.Separator />
									<DropdownMenu.Group>
										<DropdownMenu.Item>
											${costPerMillionTokens(activeModel.pricing.prompt)}/M input tokens
										</DropdownMenu.Item>
										<DropdownMenu.Item>
											${costPerMillionTokens(activeModel.pricing.completion)}/M output tokens
										</DropdownMenu.Item>
										<DropdownMenu.Item>
											{formatNumberShort(activeModel.context_length)} context
										</DropdownMenu.Item>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
