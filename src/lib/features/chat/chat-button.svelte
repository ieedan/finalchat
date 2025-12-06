<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { Ellipsis, LoaderCircle, PencilIcon, PinIcon, PinOffIcon, TrashIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
	import * as Rename from '$lib/components/ui/rename';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { navigating } from '$app/state';
	import { warm } from '$lib/cache/cached-query.svelte';

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

	const backgroundClass =
		'bg-accent group-data-[active=true]/menu-button:bg-accent group-hover/menu-button:bg-accent';

	let pinned = $derived(chat.pinned);

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
				<a
					{...props}
					href="/chat/{chat._id}"
					class="group/menu-button hover:bg-accent transition-none data-[active=true]:bg-accent flex h-auto items-center gap-1 rounded-md px-2 py-2"
					onpointerover={() => {
						warm(client, api.chat.get, {
							chatId: chat._id
						});
					}}
				>
					<div class="flex min-w-0 flex-1 items-center gap-1">
						<Rename.Root
							this="span"
							value={chat.title}
							class="min-w-0 flex-1 rounded-none border-none outline-none focus:ring-0! data-[mode=view]:truncate"
							fallbackSelectionBehavior="all"
							onSave={renameChat}
							bind:mode={renamingMode}
						/>
						{#if renamingMode === 'view'}
							<div
								class={cn('flex shrink-0 items-center', 'opacity-0', {
									'opacity-100': chat.generating,
									'group-hover/menu-button:opacity-100': true
								})}
							>
								{#if chat.generating}
									<div class={cn('flex size-8 items-center justify-center', backgroundClass)}>
										<LoaderCircle class="size-3.5! animate-spin" />
									</div>
								{:else}
									<DropdownMenu.Root>
										<DropdownMenu.Trigger
											tabindex={-1}
											class={cn(
												'inline-flex size-8 items-center justify-center rounded-md bg-transparent hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
												backgroundClass
											)}
											onclick={(e: MouseEvent) => {
												e.preventDefault();
												e.stopPropagation();
											}}
										>
											<Ellipsis class="size-3.5!" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content
											align="end"
											side="bottom"
											onclick={(e: MouseEvent) => {
												e.stopPropagation();
											}}
										>
											<DropdownMenu.Item
												onSelect={(e) => {
													e.preventDefault();
													togglePinned();
												}}
											>
												{#if !chat.pinned}
													<PinIcon class="size-4!" />
													Pin
												{:else}
													<PinOffIcon class="size-4!" />
													Unpin
												{/if}
											</DropdownMenu.Item>
											<DropdownMenu.Item
												onSelect={(e) => {
													e.preventDefault();
													renamingMode = 'edit'
												}}
											>
												<PencilIcon class="size-4!" />
												Edit
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												variant="destructive"
												onSelect={(e) => {
													e.preventDefault();
													startDeleteChat();
												}}
											>
												<TrashIcon class="size-4!" />
												Delete
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								{/if}
							</div>
						{/if}
					</div>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Rename.Provider>
