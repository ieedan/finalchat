<script lang="ts">
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { RiArrowDownSLine as ChevronDown, RiSendPlaneLine as SendIcon, RiImageLine as ImageIcon, RiBrainLine as BrainIcon } from 'remixicon-svelte';

	type Props = {
		mode: 'basic' | 'advanced';
	};

	let { mode = $bindable('advanced') }: Props = $props();
</script>

<RadioGroup.Root bind:value={mode} class="flex flex-col md:grid gap-2 md:grid-cols-2">
	<label
		for="basic"
		class={cn(
			'border border-border rounded-md p-4 flex flex-col justify-between transition-all bg-background',
			mode === 'basic' && 'ring-2 ring-primary'
		)}
	>
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<RadioGroup.Item id="basic" value="basic" />
				<span>Basic</span>
			</div>
			<p class="text-sm text-muted-foreground">Simple, safe, and accessible to anyone.</p>
		</div>
		<div class="rounded-lg border flex flex-col mt-4">
			<div class="p-2">
				<p class="text-xs text-muted-foreground">Ask anything...</p>
			</div>
			<div class="p-2 flex items-center gap-2 justify-between">
				<div class="flex items-center gap-1">
					<div
						class="text-xs rounded-sm border bg-accent border-border px-1.5 py-0.5 flex items-center gap-1"
					>
						Fast
						<ChevronDown class="size-3" />
					</div>
					<div class="bg-accent size-5.5 flex items-center rounded-sm justify-center">
						<ImageIcon class="size-3" />
					</div>
				</div>
				<div class={cn(buttonVariants({ size: 'icon', variant: 'default' }), 'h-6 w-6')}>
					<SendIcon class="size-3" />
				</div>
			</div>
		</div>
	</label>
	<label
		for="advanced"
		class={cn(
			'border border-border rounded-md p-4 flex flex-col justify-between transition-all bg-background',
			mode === 'advanced' && 'ring-2 ring-primary'
		)}
	>
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<RadioGroup.Item id="advanced" value="advanced" />
				<span>Advanced</span>
			</div>
			<p class="text-sm text-muted-foreground">Advanced with more control and customization.</p>
		</div>
		<div class="rounded-lg border flex flex-col mt-4">
			<div class="p-2">
				<p class="text-xs text-muted-foreground">Ask anything...</p>
			</div>
			<div class="p-2 flex items-center gap-2 justify-between">
				<div class="flex items-center gap-1">
					<div
						class="text-xs rounded-sm border bg-accent border-border px-1.5 py-0.5 flex items-center gap-1"
					>
						GPT-5.1
						<ChevronDown class="size-3" />
					</div>
					<div class="bg-accent size-5.5 flex items-center rounded-sm justify-center">
						<ImageIcon class="size-3" />
					</div>
					<div class="bg-accent size-5.5 flex items-center rounded-sm justify-center">
						<BrainIcon class="size-3" />
					</div>
				</div>
				<div class={cn(buttonVariants({ size: 'icon', variant: 'default' }), 'h-6 w-6')}>
					<SendIcon class="size-3" />
				</div>
			</div>
		</div>
	</label>
</RadioGroup.Root>
