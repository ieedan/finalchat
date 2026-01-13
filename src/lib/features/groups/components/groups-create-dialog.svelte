<script lang="ts" module>
	import { z } from 'zod';

	const CreateGroupSchema = z.object({
		name: z.string().min(1),
		description: z.string().optional(),
		canViewMembersChats: z.boolean().default(false),
		allowPublicChats: z.boolean().default(true),
		apiKey: z.string().min(1)
	});
</script>

<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Modal from '$lib/components/ui/modal';
	import { PlusIcon } from '@lucide/svelte';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import ApiKeyInput from '$lib/features/api-keys/api-key-input.svelte';
	import { useGroupSettings } from '../group.svelte';

	const groupSettingsState = useGroupSettings();

	const form = superForm(defaults(zod4(CreateGroupSchema)), {
		validators: zod4(CreateGroupSchema),
		onUpdate: async ({ form }) => {
			if (!form.valid) return;

			await groupSettingsState.createGroup({
				name: form.data.name,
				description: form.data.description,
				canViewMembersChats: form.data.canViewMembersChats,
				allowPublicChats: form.data.allowPublicChats,
				apiKey: form.data.apiKey
			});
		},
		SPA: true
	});

	const { form: fd, enhance, submitting } = form;
</script>

<Modal.Root>
	<Modal.Trigger class={cn(buttonVariants({ variant: 'default' }))}>
		<PlusIcon />
		Create Group
	</Modal.Trigger>
	<Modal.Content>
		<form use:enhance method="POST" class="contents">
			<Modal.Header>
				<Modal.Title>Create Group</Modal.Title>
				<Modal.Description>Create a new group.</Modal.Description>
			</Modal.Header>
			<Field.Group>
				<Field.Set>
					<Field.Field>
						<Field.Label>Name</Field.Label>
						<Input bind:value={$fd.name} placeholder="Name" />
					</Field.Field>
					<Field.Field>
						<Field.Label>Description</Field.Label>
						<Textarea bind:value={$fd.description} placeholder="Description... (optional)" />
					</Field.Field>
				</Field.Set>
				<Field.Set>
					<Field.Legend>Group settings</Field.Legend>
					<Field.Description>Configure the settings for the group.</Field.Description>
					<Field.Group class="gap-3">
						<Field.Field orientation="horizontal" class="gap-2">
							<Checkbox bind:checked={$fd.canViewMembersChats} class="border-border" />
							<Field.Label>Can view members chats</Field.Label>
						</Field.Field>
						<Field.Field orientation="horizontal" class="gap-2">
							<Checkbox bind:checked={$fd.allowPublicChats} class="border-border" />
							<Field.Label>Allow members to create public chats</Field.Label>
						</Field.Field>
					</Field.Group>
				</Field.Set>
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label>API Key</Field.Label>
							<ApiKeyInput bind:apiKey={$fd.apiKey} />
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</Field.Group>
			<Modal.Footer>
				<Button type="submit" loading={$submitting}>Create</Button>
			</Modal.Footer>
		</form>
	</Modal.Content>
</Modal.Root>
