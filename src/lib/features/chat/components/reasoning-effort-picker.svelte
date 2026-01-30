<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import { useReasoningEffortPicker } from './prompt-input/prompt-input.svelte.js';
	import {
		RiBrainLine as BrainIcon,
		RiBrain4Line as Brain4Icon,
		RiBrain2Line as Brain2Icon,
		RiBrain3Line as Brain3Icon,
		RiBrainAi3Line as BrainAi3Icon,
		RiSettings6Line as Settings6Icon
	} from 'remixicon-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	const reasoningEffortPickerState = useReasoningEffortPicker();

	const options = [
		{ label: 'Default', value: 'default', icon: Settings6Icon, iconClass: 'text-muted-foreground' },
		{ label: 'X-High', value: 'xhigh', icon: Brain4Icon },
		{ label: 'High', value: 'high', icon: BrainAi3Icon },
		{ label: 'Medium', value: 'medium', icon: BrainIcon },
		{ label: 'Low', value: 'low', icon: Brain2Icon },
		{ label: 'Minimal', value: 'minimal', icon: Brain3Icon },
		{ label: 'None', value: 'none', icon: BrainIcon, iconClass: 'text-muted-foreground' }
	];

	const selectedOption = $derived(
		options.find(
			(option) => option.value === reasoningEffortPickerState.rootState.opts.reasoningEffort.current
		)
	);
</script>

<Select.Root
	type="single"
	bind:value={reasoningEffortPickerState.rootState.opts.reasoningEffort.current}
>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Select.Trigger
					class={cn(
						'p-0',
						buttonVariants({ variant: 'input', size: 'icon' }),
						'bg-background dark:bg-input'
					)}
					hideIcon
					{...props}
				>
					{#if selectedOption}
						<selectedOption.icon class={cn('size-4 text-foreground', selectedOption.iconClass)} />
					{/if}
				</Select.Trigger>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			Reasoning Effort {selectedOption?.label}
		</Tooltip.Content>
	</Tooltip.Root>
	<Select.Content align="start" side="top" class="overflow-y-auto">
		{#each options as option (option.value)}
			<Select.Item value={option.value}>
				<option.icon class={cn('size-4 shrink-0 text-foreground', option.iconClass)} />
				{option.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
