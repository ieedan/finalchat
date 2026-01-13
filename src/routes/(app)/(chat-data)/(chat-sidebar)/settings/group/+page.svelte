<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import * as Card from '$lib/components/ui/card';
	import * as Item from '$lib/components/ui/item';
	import { Button } from '$lib/components/ui/button';
	import { useChatLayout } from '$lib/features/chat/chat.svelte.js';
	import { DoorOpenIcon } from '@lucide/svelte';
	import GroupsCreateDialog from '$lib/features/groups/components/groups-create-dialog.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import GroupApiKeyCard from '$lib/features/groups/components/group-api-key-card.svelte';
	import GroupMembersCard from '$lib/features/groups/components/group-members-card.svelte';
	import { setupGroupSettings } from '$lib/features/groups/group.svelte';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { api } from '$lib/convex/_generated/api';
	import * as Table from '$lib/components/ui/table';

	const chatLayoutState = useChatLayout();

	const groupSettingsState = setupGroupSettings();

	const invitationsQuery = useCachedQuery(api.users.getGroupInvites, {});
</script>

<AccountSettings.Page>
	<Card.Root class="gap-3">
		<Card.Header class="flex-1 flex flex-col items-start justify-center">
			<Card.Title>
				{#if chatLayoutState.isPartOfAGroup}
					{#if groupSettingsState.groupQuery.isLoading}
						<Skeleton class="w-24 h-5.5" />
					{:else}
						<div class="flex items-center gap-2">
							<span class="font-medium">
								{groupSettingsState.group?.name}
							</span>
							{#if groupSettingsState.isAdmin}
								<Badge variant="default">Admin</Badge>
							{/if}
						</div>
					{/if}
				{:else}
					You are not currently part of a group
				{/if}
			</Card.Title>
			{#if chatLayoutState.isPartOfAGroup}
				{#if groupSettingsState.group?.description}
					<Card.Description>
						{groupSettingsState.group.description}
					</Card.Description>
				{/if}
			{:else}
				<Card.Description>Join or create a group to continue.</Card.Description>
			{/if}
		</Card.Header>
		{#if !chatLayoutState.isPartOfAGroup}
			<div class="px-4">
				<GroupsCreateDialog />
			</div>
		{/if}
		{#if chatLayoutState.isPartOfAGroup}
			<Card.Content>
				<Field.Group>
					<Field.Set>
						<Field.Group class="gap-3">
							<Field.Field orientation="horizontal" class="gap-2">
								{#if groupSettingsState.groupQuery.isLoading}
									<Skeleton class="size-4 rounded-[4px]" />
								{:else}
									<Checkbox
										readonly
										checked={groupSettingsState.group?.options?.canViewMembersChats}
										class="border-border"
									/>
								{/if}
								<Field.Label>Can view members chats</Field.Label>
							</Field.Field>
							<Field.Field orientation="horizontal" class="gap-2">
								{#if groupSettingsState.groupQuery.isLoading}
									<Skeleton class="size-4 rounded-[4px]" />
								{:else}
									<Checkbox
										readonly
										checked={groupSettingsState.group?.options?.allowPublicChats}
										class="border-border"
									/>
								{/if}
								<Field.Label>Allow members to create public chats</Field.Label>
							</Field.Field>
						</Field.Group>
					</Field.Set>
				</Field.Group>
			</Card.Content>
		{/if}
	</Card.Root>
	{#if chatLayoutState.isPartOfAGroup}
		{#if groupSettingsState.isAdmin}
			<GroupApiKeyCard />
		{/if}
		<GroupMembersCard />
		<Item.Root variant="outline" class="bg-card">
			<Item.Content>
				<Item.Title>Leave Group</Item.Title>
				<Item.Description>
					Leave this group. You will lose access to all group features and shared resources.
				</Item.Description>
			</Item.Content>
			<Item.Actions>
				<Button variant="destructive" class="gap-2" onClickPromise={groupSettingsState.leaveGroup}>
					<DoorOpenIcon class="size-4" />
					Leave
				</Button>
			</Item.Actions>
		</Item.Root>
	{/if}
	<Card.Root>
		<Card.Header>
			<Card.Title>Invitations</Card.Title>
			<Card.Description>Join a group to get started</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="border border-border rounded-lg bg-background">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Group</Table.Head>
							<Table.Head>Invited By</Table.Head>
							<Table.Head>Expires At</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if (invitationsQuery.data?.length ?? 0) > 0}
							{#each invitationsQuery.data as invitation (invitation.workosInvitationId)}
								<Table.Row>
									<Table.Cell>{invitation.organization.name}</Table.Cell>
									<Table.Cell>{invitation.invitedBy.name}</Table.Cell>
									<Table.Cell>
										{new Date(invitation.expiresAt).toLocaleDateString()}
									</Table.Cell>
								</Table.Row>
							{/each}
						{:else}
							<Table.Row>
								<Table.Cell colspan={3} class="h-24 text-center">No invitations found.</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</Card.Content>
	</Card.Root>
</AccountSettings.Page>
