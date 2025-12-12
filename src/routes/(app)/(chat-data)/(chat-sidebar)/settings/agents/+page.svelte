<script lang="ts">
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import { MetaTags } from '$lib/components/meta-tags';
	import { api } from '$lib/convex/_generated/api';
	import * as Item from '$lib/components/ui/item';
	import { useChatLayout } from '$lib/features/chat/chat.svelte.js';
	import * as Empty from '$lib/components/ui/empty';
	import { BotIcon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Modal from '$lib/components/ui/modal';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	const chatLayoutState = useChatLayout();

	const agentsQuery = useCachedQuery(api.agent.getAll, {});

	let createAgentModalOpen = $state(false);

	function openCreateAgentModal() {
		createAgentModalOpen = true;
	}
</script>

<MetaTags title="Agents" />

<AccountSettings.Page>
	<AccountSettings.PageHeader>
		<AccountSettings.PageTitle>Agents</AccountSettings.PageTitle>
		<AccountSettings.PageDescription>
			Create custom agents to use in your chats.
		</AccountSettings.PageDescription>
	</AccountSettings.PageHeader>

	{#if agentsQuery.data?.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media>
					<BotIcon class="size-10" />
				</Empty.Media>
				<Empty.Title>No Agents Yet</Empty.Title>
				<Empty.Description>Create your first agent to get started.</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button onclick={openCreateAgentModal}>Create Agent</Button>
			</Empty.Content>
		</Empty.Root>
	{:else}
		{#each agentsQuery.data as agent (agent._id)}
			{@const model = chatLayoutState.models.find((m) => m.id === agent.modelId)}
			<Item.Root>
				<Item.Content>
					<Item.Title>{agent.name}</Item.Title>
					<Item.Description>{model?.name}</Item.Description>
				</Item.Content>
			</Item.Root>
		{/each}
	{/if}
</AccountSettings.Page>

<Modal.Root bind:open={createAgentModalOpen}>
	<Modal.Content>
		<Modal.Header>
			<Modal.Title>Create Agent</Modal.Title>
			<Modal.Description>Create a new agent to use in your chats.</Modal.Description>
		</Modal.Header>
		<Field.Group>
			<Field.Field>
				<Field.Label>Name</Field.Label>
				<Input placeholder="My Agent" />
			</Field.Field>
			<Field.Field>
				<Field.Label>System Prompt</Field.Label>
				<Textarea placeholder="How should the agent behave?" />
			</Field.Field>
		</Field.Group>
	</Modal.Content>
</Modal.Root>
