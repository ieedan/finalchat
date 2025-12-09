<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { cn } from '$lib/utils';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import SendIcon from '@lucide/svelte/icons/send';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { api } from '$lib/convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';
	import ImageIcon from '@lucide/svelte/icons/image';
	import BrainIcon from '@lucide/svelte/icons/brain';

	let mode = $state<'basic' | 'advanced'>('advanced');

	const convex = useConvexClient();

	async function submit() {
		try {
			await convex.mutation(api.userSettings.updateMode, {
				mode
			});
		} catch (error) {
			console.error(error);
		}
	}
</script>

<AlertDialog.Header>
	<AlertDialog.Title>Choose your experience</AlertDialog.Title>
	<AlertDialog.Description>
		You can always change this later in your settings.
	</AlertDialog.Description>
</AlertDialog.Header>
<div class="flex flex-col gap-4">
	<RadioGroup.Root bind:value={mode} class="grid gap-2 grid-cols-2">
		<label
			for="basic"
			class={cn(
				'border rounded-md p-4 flex flex-col justify-between transition-all',
				mode === 'basic' && 'border-primary bg-accent/50'
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
				'border rounded-md p-4 flex flex-col justify-between transition-all',
				mode === 'advanced' && 'border-primary bg-accent/50'
			)}
		>
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<RadioGroup.Item id="advanced" value="advanced" />
					<span>Advanced</span>
				</div>
				<p class="text-sm text-muted-foreground">
					Advanced mode with more control and customization.
				</p>
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
	<div class="flex items-center justify-between">
		<div></div>
		<Button class="gap-1" onClickPromise={submit}>
			Next
			<ArrowRightIcon />
		</Button>
	</div>
</div>
