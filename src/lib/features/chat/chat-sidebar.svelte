<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { sidebarMenuButtonVariants } from '$lib/components/ui/sidebar/sidebar-menu-button.svelte';
	import { useChatLayout } from './chat.svelte';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { goto } from '$app/navigation';
	import { DEFAULT_AGE_GROUPS, getAgedGroups } from '$lib/utils/aged-groups';
	import ChatButton from './chat-button.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ChatGotoDialog from './chat-goto-dialog.svelte';
	import { cn } from '$lib/utils';
	import * as Kbd from '$lib/components/ui/kbd';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';

	const chatContext = useChatLayout();

	const indexedChats = $derived(
		chatContext.chatsQuery.data?.map((chat, i) => ({
			...chat,
			index: i + 1
		})) ?? []
	);

	const pinnedChats = $derived(indexedChats.filter((chat) => chat.pinned) ?? []);

	const groups = $derived(
		getAgedGroups(
			indexedChats.filter((chat) => !chat.pinned),
			{
				getAge: (item) => item.updatedAt,
				groups: DEFAULT_AGE_GROUPS
			}
		)
	);

	let chatGotoDialogOpen = $state(false);
	let gotoChatIndex = $state<number | null>(null);

	const sidebar = Sidebar.useSidebar();

	const headerTrigger = $derived(sidebar.isMobile || !sidebar.open);
</script>

<!-- 
sidebar trigger
this has to be out here because the sidebar isn't rendered all the time on mobile
-->
<div
	class={cn(
		'transition-transform left-0 top-2.5 fixed translate-x-[244px] z-21 duration-200',
		headerTrigger && 'translate-x-[12px]'
	)}
>
	<Sidebar.Trigger />
</div>

<Sidebar.Root variant="inset">
	<Sidebar.Header class="pt-0">
		<div class="flex items-center justify-between h-9">
			<a href="/chat" class="text-2xl font-bold">Chat</a>
			{#if sidebar.isMobile}
				<Sidebar.Trigger />
			{/if}
		</div>
		<Sidebar.MenuButton>
			{#snippet child({ props: { class: _, ...props } })}
				<a
					href="/chat"
					class={cn(
						buttonVariants({ variant: 'default' }),
						chatContext.userSettingsQuery.data?.onboarding?.mode === 'advanced' &&
							'flex items-center justify-between'
					)}
					{...props}
				>
					<span class="flex items-center gap-2">
						<PlusIcon class="size-4!" />
						New Chat
					</span>
					{#if chatContext.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
						<Kbd.Group
							class="**:data-[slot=kbd]:bg-transparent **:data-[slot=kbd]:text-foreground gap-0"
						>
							<Kbd.Root>{cmdOrCtrl}</Kbd.Root>
							<Kbd.Root>⇧</Kbd.Root>
							<Kbd.Root>O</Kbd.Root>
						</Kbd.Group>
					{/if}
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.Header>
	<Sidebar.Content>
		{#if pinnedChats.length > 0}
			<Sidebar.Group class="py-0">
				<Sidebar.GroupLabel>Pinned</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu class="gap-0.5">
						{#each pinnedChats as chat (chat._id)}
							<ChatButton {chat} gotoOpen={chatGotoDialogOpen} gotoIndex={gotoChatIndex} />
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
		{#each Object.entries(groups) as [name, chats] (name)}
			{#if chats.length > 0}
				<Sidebar.Group class="py-0">
					<Sidebar.GroupLabel>{name}</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu class="gap-0.5">
							{#each chats as chat (chat._id)}
								<ChatButton {chat} gotoOpen={chatGotoDialogOpen} gotoIndex={gotoChatIndex} />
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			{/if}
		{/each}
	</Sidebar.Content>
	<Sidebar.Footer>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={sidebarMenuButtonVariants({ size: 'lg' })}>
				<div class="flex items-center gap-2">
					<Avatar.Root>
						<Avatar.Image src={chatContext.user.profilePictureUrl} />
						<Avatar.Fallback>
							{chatContext.user.firstName?.charAt(0)}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex flex-col gap-0.5">
						<span class="text-sm font-medium">
							{chatContext.user.firstName}
							{chatContext.user.lastName}
						</span>
						<span class="text-xs text-muted-foreground">
							{chatContext.user.email}
						</span>
					</div>
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)" align="center" side="top">
				<DropdownMenu.Item class="flex items-center justify-between gap-2">
					<span>Settings</span>
					<SettingsIcon />
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="flex items-center justify-between gap-2"
					onSelect={() => goto('/auth/signout')}
				>
					<span>Logout</span>
					<LogOutIcon />
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.Footer>
</Sidebar.Root>

<ChatGotoDialog
	bind:open={chatGotoDialogOpen}
	totalChats={indexedChats.length}
	bind:value={gotoChatIndex}
	onSubmit={async (value) => {
		const chat = indexedChats[value - 1];
		if (chat) {
			await goto(`/chat/${chat._id}`);
		}
		chatGotoDialogOpen = false;
	}}
/>
