<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { Ellipsis, PencilIcon, PinIcon, PinOffIcon, SplitIcon, TrashIcon } from '@lucide/svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
	import * as Rename from '$lib/components/ui/rename';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { navigating } from '$app/state';
	import { warm } from '$lib/cache/cached-query.svelte';

	type Props = {
		chat: Doc<'chat'> & { index: number };
		gotoOpen: boolean;
		gotoIndex: number | null;
	};

	let { chat, gotoOpen, gotoIndex }: Props = $props();

	const client = useConvexClient();

	async function startDeleteChat(shiftKey?: boolean) {
		confirmDelete({
			title: 'Are you sure you want to delete this chat?',
			description: 'This action cannot be undone.',
			skipConfirmation: shiftKey,
			onConfirm: deleteChat
		});
	}

	async function deleteChat() {
		await client.mutation(api.chat.remove, {
			ids: [chat._id]
		});

		if (page.params.chatId === chat._id) await goto('/chat');
	}

	async function renameChat(title: string) {
		if (title.trim().length === 0) {
			return chat.title;
		}

		client.mutation(api.chat.updateTitle, {
			chatId: chat._id,
			title
		});

		return title;
	}

	async function togglePinned() {
		pinned = !pinned;
		await client.mutation(api.chat.updatePinned, {
			chatId: chat._id,
			pinned: !chat.pinned
		});
	}

	let pinned = $derived(chat.pinned);
	let dropdownOpen = $state(false);
	let renamingMode = $state<'view' | 'edit'>('view');

	const sidebar = useSidebar();

	$effect(() => {
		navigating.complete?.then(() => {
			sidebar.setOpenMobile(false);
		});
	});
</script>

<Rename.Provider>
	<Sidebar.MenuItem>
		<Sidebar.MenuButton
			isActive={page.url.pathname.includes(`/chat/${chat._id}`)}
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'F2') {
					renamingMode = 'edit';
				}
			}}
		>
			{#snippet child({ props: { class: _, ...props } })}
				<div
					data-active={page.url.pathname.includes(`/chat/${chat._id}`)}
					class="group/menu-button hover:bg-sidebar-accent focus-within:bg-sidebar-accent rounded-md flex items-center gap-2 h-8.5 data-[active=true]:bg-sidebar-accent"
					onpointerover={() => {
						warm(client, api.chat.get, {
							chatId: chat._id
						});
					}}
					onfocus={() => {
						warm(client, api.chat.get, {
							chatId: chat._id
						});
					}}
				>
					<a
						{...props}
						href="/chat/{chat._id}"
						class="flex min-w-0 flex-1 items-center gap-2 pl-3 h-full outline-none"
					>
						{#if chat.generating}
							<Spinner />
						{:else if chat.branchedFrom}
							<button
								type="button"
								onclick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									goto(`/chat/${chat.branchedFrom!.chatId}`);
								}}
								class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							>
								<SplitIcon class="size-4" />
							</button>
						{/if}
						<Rename.Root
							this="span"
							value={chat.title}
							class={cn(
								'min-w-0 flex-1 text-sm rounded-none border-none outline-none focus:ring-0! data-[mode=view]:truncate',
								gotoOpen && chat.index === gotoIndex ? 'bg-yellow-300 text-black' : ''
							)}
							fallbackSelectionBehavior="all"
							blurBehavior="exit"
							onSave={renameChat}
							bind:mode={renamingMode}
						/>
						{#if gotoOpen}
							<span class="text-xs text-muted-foreground font-mono pl-2">{chat.index}</span>
						{/if}
					</a>
					{#if renamingMode === 'view'}
						<div
							class={cn(
								'flex shrink-0 h-full items-center opacity-0 group-data-[active=true]/menu-button:opacity-100 group-hover/menu-button:opacity-100',
								{
									'opacity-100': dropdownOpen
								}
							)}
						>
							<DropdownMenu.Root bind:open={dropdownOpen}>
								<DropdownMenu.Trigger
									tabindex={-1}
									data-open={dropdownOpen}
									class={cn(
										'inline-flex group-hover/menu-button:w-9 group-data-[active=true]/menu-button:w-9 bg-sidebar-accent data-[open=true]:w-9! w-0 h-full items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
									)}
								>
									<Ellipsis class="size-4 shrink-0" />
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" side="bottom" animated={false}>
									<DropdownMenu.Item onSelect={() => togglePinned()}>
										{#if !chat.pinned}
											<PinIcon class="size-4!" />
											Pin
										{:else}
											<PinOffIcon class="size-4!" />
											Unpin
										{/if}
									</DropdownMenu.Item>
									<DropdownMenu.Item onSelect={() => (renamingMode = 'edit')}>
										<PencilIcon class="size-4!" />
										Rename
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item variant="destructive" onSelect={() => startDeleteChat()}>
										<TrashIcon class="size-4!" />
										Delete
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					{/if}
				</div>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Rename.Provider>
