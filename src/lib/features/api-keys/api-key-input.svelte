<script lang="ts">
	import { cn } from '$lib/utils';
	import * as Select from '$lib/components/ui/select';
	import * as Password from '$lib/components/ui/password';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import CloudCheckIcon from '@lucide/svelte/icons/cloud-check';

	type Props = {
		apiKey: string;
		storage: 'Local' | 'Remote';
	};

	let { apiKey = $bindable(''), storage = $bindable<'Local' | 'Remote'>('Local') }: Props =
		$props();

	const storageOptions: { label: string; icon: typeof MonitorIcon; description: string }[] = [
		{
			label: 'Local',
			icon: MonitorIcon,
			description: 'Stored securely in your browser.'
		},
		{
			label: 'Remote',
			icon: CloudCheckIcon,
			description: 'Stored securely on our servers.'
		}
	];

	const selectedOption = $derived(storageOptions.find((option) => option.label === storage));
</script>

<div
	data-maybe-invalid={apiKey && !apiKey.startsWith('sk-or-')}
	class={cn(
		'flex items-center border border-border rounded-md bg-transparent dark:bg-input/30 data-[maybe-invalid=true]:border-amber-500 data-[maybe-invalid=true]:ring-amber-500',
		'focus-within:ring-2 px-1 focus-within:ring-ring ring-offset-2 ring-offset-background transition-all'
	)}
>
	<Select.Root type="single" bind:value={storage}>
		<Select.Trigger
			class="border-none bg-transparent! dark:hover:bg-input/30! px-2.5 rounded-lg h-7!"
		>
			{#if selectedOption}
				<selectedOption.icon class="size-4" />
			{/if}
		</Select.Trigger>
		<Select.Content align="start">
			{#each storageOptions as option (option.label)}
				<Select.Item value={option.label} class="flex flex-col gap-0 items-start">
					<div class="flex items-center gap-2">
						<option.icon class="size-4" />
						{option.label}
					</div>
					<span class="text-sm text-muted-foreground">{option.description}</span>
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Password.Root class="w-full">
		<Password.Input
			class="w-full border-none pl-1 bg-transparent! focus:ring-0!"
			placeholder="sk-or-v1-..."
			autocomplete="off"
			bind:value={apiKey}
		>
			<Password.ToggleVisibility />
		</Password.Input>
	</Password.Root>
</div>
