<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { api } from '$lib/convex/_generated/api';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { useConvexClient } from 'convex-svelte';
	import * as Password from '$lib/components/ui/password';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Field from '$lib/components/ui/field';

	let storage = $state<'Local' | 'Remote'>('Local');

	const convex = useConvexClient();

	async function skip() {
		await convex.mutation(api.userSettings.completeSetupApiKey, {});
	}
</script>

<AlertDialog.Header>
	<AlertDialog.Title>Setup API Key</AlertDialog.Title>
	<AlertDialog.Description>Enter an OpenRouter API key to get started.</AlertDialog.Description>
</AlertDialog.Header>
<Field.Group class="gap-2">
	<div class="flex items-center gap-2">
		<Select.Root type="single" bind:value={storage}>
			<Select.Trigger class="w-[115px]">
				{storage}
			</Select.Trigger>
			<Select.Content align="start">
				<Select.Item value="Local" class="flex flex-col gap-0 items-start">
					Local
					<span class="text-sm text-muted-foreground">Stored securely in your browser.</span>
				</Select.Item>
				<Select.Item value="Remote" class="flex flex-col gap-0 items-start">
					Remote
					<span class="text-sm text-muted-foreground">Stored securely on our servers.</span>
				</Select.Item>
			</Select.Content>
		</Select.Root>
		<Password.Root class="w-full">
			<Password.Input class="w-full" placeholder="sk-or-v1-...">
				<Password.ToggleVisibility />
			</Password.Input>
		</Password.Root>
	</div>
	{#if storage === 'Remote'}
		<Field.Field>
			<Label>Name</Label>
			<Input type="text" placeholder="Name" />
		</Field.Field>
	{/if}
</Field.Group>
<div class="flex items-center justify-between">
	<Button variant="outline" onClickPromise={skip}>Skip</Button>
	<Button class="gap-1">
		Next
		<ArrowRightIcon />
	</Button>
</div>
