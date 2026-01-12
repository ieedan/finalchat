<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { api } from '$lib/convex/_generated/api';
	import { useChatLayout } from '$lib/features/chat/chat.svelte.js';
	import { DoorOpenIcon } from '@lucide/svelte';
	import * as Table from '$lib/components/ui/table';
	import GroupsCreateDialog from '$lib/features/groups/components/groups-create-dialog.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	const chatLayoutState = useChatLayout();

	const groupQuery = useCachedQuery(api.groups.getGroup, {
		get groupId() {
			return chatLayoutState.userSettings?.membership?.workosGroupId;
		}
	});
	const invitationsQuery = useCachedQuery(api.user.getGroupInvites, {});

	const isPartOfAGroup = $derived(Boolean(chatLayoutState.userSettings?.membership?.workosGroupId));

	const client = useConvexClient();

	async function leaveGroup() {
		try {
			await client.action(api.groups.leaveGroup, {});
		} catch (error) {
			toast.error('Failed to leave group', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
</script>

<AccountSettings.Page>
	<Card.Root class="gap-3">
		<div class="flex items-center justify-between w-full">
			<Card.Header class="flex-1 flex flex-col items-start justify-center">
				<Card.Title>
					{#if isPartOfAGroup}
						{#if groupQuery.isLoading}
							<Skeleton class="w-24 h-5.5" />
						{:else}
							<div class="flex items-center gap-2">
								<span class="font-medium">
									{groupQuery.data?.name}
								</span>
								{#if chatLayoutState.userSettings?.membership?.role === 'admin'}
									<Badge variant="default">Admin</Badge>
								{/if}
							</div>
						{/if}
					{:else}
						You are not currently part of a group
					{/if}
				</Card.Title>
				{#if isPartOfAGroup}
					{#if groupQuery.data?.description}
						<Card.Description>
							{groupQuery.data.description}
						</Card.Description>
					{/if}
				{:else}
					<Card.Description>Join or create a group to continue.</Card.Description>
				{/if}
			</Card.Header>
			<div class="px-4">
				{#if isPartOfAGroup}
					<Button variant="destructive" class="gap-2" onClickPromise={leaveGroup}>
						<DoorOpenIcon class="size-4" />
						Leave
					</Button>
				{:else}
					<GroupsCreateDialog />
				{/if}
			</div>
		</div>
		{#if isPartOfAGroup}
			<Card.Content>
				<Field.Group>
					<Field.Set>
						<Field.Group class="gap-3">
							<Field.Field orientation="horizontal" class="gap-2">
								{#if groupQuery.isLoading}
									<Skeleton class="size-4 rounded-[4px]" />
								{:else}
									<Checkbox
										readonly
										checked={groupQuery.data?.options.canViewMembersChats}
										class="border-border"
									/>
								{/if}
								<Field.Label>Can view members chats</Field.Label>
							</Field.Field>
							<Field.Field orientation="horizontal" class="gap-2">
								{#if groupQuery.isLoading}
									<Skeleton class="size-4 rounded-[4px]" />
								{:else}
									<Checkbox
										readonly
										checked={groupQuery.data?.options.allowPublicChats}
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
	{#if (invitationsQuery.data?.length ?? 0) > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title>Invitations</Card.Title>
				<Card.Description>
					{isPartOfAGroup
						? 'Joining a group will cause you to leave your current group'
						: 'Join a group to get started'}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="border border-border rounded-lg bg-background">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Organization</Table.Head>
								<Table.Head>Invited By</Table.Head>
								<Table.Head>Expires At</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each invitationsQuery.data as invitation}
								<Table.Row>
									<Table.Cell>{invitation.organization.name}</Table.Cell>
									<Table.Cell>{invitation.invitedBy.name}</Table.Cell>
									<Table.Cell>
										{new Date(invitation.expiresAt).toLocaleDateString()}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
				<!-- TODO: group invitations display -->
			</Card.Content>
		</Card.Root>
	{/if}
</AccountSettings.Page>
