<script lang="ts">
	import { useReasoningEffortPicker } from '$lib/features/chat/components/prompt-input/prompt-input.svelte.js';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import { cn } from '$lib/utils';
	import { RiBrainLine as BrainIcon, RiSettings6Line as Settings6Icon } from 'remixicon-svelte';
	import { usePlusState } from './prompt-input-mobile-plus.svelte';

	const reasoningEffortPickerState = useReasoningEffortPicker();
	const plusState = usePlusState();

	const isDefault = $derived(
		reasoningEffortPickerState.rootState.opts.reasoningEffort.current === 'default'
	);

	const options = [
		{ label: 'Default', value: 'default' },
		{ label: 'X-High', value: 'xhigh' },
		{ label: 'High', value: 'high' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'Low', value: 'low' },
		{ label: 'Minimal', value: 'minimal' },
		{ label: 'None', value: 'none' }
	];
</script>

<NativeSelect.Root
	bind:value={reasoningEffortPickerState.rootState.opts.reasoningEffort.current}
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
		{#if isDefault}
			<Settings6Icon class="size-4" />
		{:else}
			<BrainIcon class="size-4" />
		{/if}
	{/snippet}
	{#each options as option (option.value)}
		<NativeSelect.Option value={option.value}>
			{option.label}
		</NativeSelect.Option>
	{/each}
</NativeSelect.Root>
