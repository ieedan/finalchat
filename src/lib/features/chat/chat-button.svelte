<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import {
		Ellipsis,
		LoaderCircle,
		PencilIcon,
		PinIcon,
		PinOffIcon,
		TrashIcon
	} from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
	import * as Rename from '$lib/components/ui/rename';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { navigating } from '$app/state';
	import { warm } from '$lib/cache/cached-query.svelte';
	import type { inspect } from 'util';

	type Props = {
		chat: Doc<'chat'>;
	};

	let { chat }: Props = $props();

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
			isActive={page.params.chatId === chat._id}
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'F2') {
					renamingMode = 'edit';
				}
			}}
		>
			{#snippet child({ props })}
				<div
					class="group/menu-button hover:bg-accent rounded-md flex items-center gap-2 h-9.5"
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
						class="flex min-w-0 flex-1 items-center gap-1 pl-3 h-full"
					>
						{#if chat.generating}
							<div class="flex shrink-0 items-center justify-center">
								<LoaderCircle class="size-4 animate-spin shrink-0" />
							</div>
						{/if}
						<Rename.Root
							this="span"
							value={chat.title}
							class="min-w-0 flex-1 rounded-none border-none outline-none focus:ring-0! data-[mode=view]:truncate"
							fallbackSelectionBehavior="all"
							blurBehavior="exit"
							onSave={renameChat}
							bind:mode={renamingMode}
						/>
					</a>
					{#if renamingMode === 'view'}
						<div
							class={cn(
								'flex shrink-0 h-full items-center opacity-0 group-hover/menu-button:opacity-100',
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
										'inline-flex group-hover/menu-button:w-9 bg-accent data-[open=true]:w-9! w-0 h-full items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
									)}
								>
									<Ellipsis class="size-4 shrink-0" />
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" side="bottom">
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
