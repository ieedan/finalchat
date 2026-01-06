<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Avatar from '$lib/components/ui/avatar';
	import { useChatLayout } from './chat.svelte';
	import { goto } from '$app/navigation';
	import { DEFAULT_AGE_GROUPS, getAgedGroups } from '$lib/utils/aged-groups';
	import ChatButton from './chat-button.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ChatGotoDialog from './chat-goto-dialog.svelte';
	import { cn } from '$lib/utils';
	import * as Kbd from '$lib/components/ui/kbd';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
	import { FinalChat } from '$lib/components/logos';
	// import { navigating } from '$app/stores';

	const chatLayoutState = useChatLayout();

	const indexedChats = $derived(
		chatLayoutState.chatsQuery.data?.map((chat, i) => ({
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

	// auto close sidebar when navigating to settings or back to chat
	// navigating.subscribe((nav) => {
	// 	if (nav?.to?.url.pathname.includes('/settings') && nav.from?.url.pathname.includes('/chat')) {
	// 		sidebar.setOpen(false);
	// 	} else if (nav?.to?.url.pathname.includes('/chat') && nav.from?.url.pathname.includes('/settings')) {
	// 		sidebar.setOpen(true);
	// 	}
	// })
</script>

<!-- 
sidebar trigger
this has to be out here because the sidebar isn't rendered all the time on mobile
-->
<div
	class={cn(
		'transition-transform left-0 top-2.5 fixed translate-x-[16px] z-21 duration-200',
		// just in case
		headerTrigger && 'translate-x-[12px]'
	)}
>
	<Sidebar.Trigger />
</div>

<Sidebar.Root variant="inset">
	<Sidebar.Header class="pt-[2px]">
		<div class="flex items-center justify-center h-9">
			<a href="/chat" class="text-2xl font-bold">
				<FinalChat class="size-6" />
			</a>
			{#if sidebar.isMobile}
				<Sidebar.Trigger class="absolute left-2" />
			{/if}
		</div>
		<Sidebar.MenuButton>
			{#snippet child({ props: { class: _, ...props } })}
				<a
					href="/chat"
					class={cn(
						buttonVariants({ variant: 'default' }),
						chatLayoutState.userSettingsQuery.data?.onboarding?.mode === 'advanced' &&
							'flex items-center justify-between'
					)}
					{...props}
				>
					<span class="flex items-center gap-2">
						<PlusIcon class="size-4!" />
						New Chat
					</span>
					{#if chatLayoutState.userSettingsQuery.data?.onboarding?.mode === 'advanced'}
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
		{#if chatLayoutState.user}
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a
						href="/settings"
						{...props}
						class={cn(props.class ?? '', 'flex items-center gap-2 h-12')}
					>
						<Avatar.Root>
							<Avatar.Image src={chatLayoutState.user?.profilePictureUrl} />
							<Avatar.Fallback>
								{chatLayoutState.user?.firstName?.charAt(0)}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex flex-col gap-0.5">
							<span class="text-sm font-medium">
								{chatLayoutState.user?.firstName}
								{chatLayoutState.user?.lastName}
							</span>
							<span class="text-xs text-muted-foreground">
								{chatLayoutState.user?.email}
							</span>
						</div>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		{:else}
			<div class="border border-border rounded-lg flex flex-col p-4 gap-4">
				<div class="flex flex-col text-sm gap-1">
					<span class="font-medium"> Get started with Finalchat </span>
					<span class="text-muted-foreground">
						Sign in to save your conversations and access them anywhere.
					</span>
				</div>
				<Button href="/auth/login" size="sm">Sign in</Button>
			</div>
		{/if}
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
