<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { Button } from '$lib/components/ui/button';
	import { LoaderCircle, PinIcon, PinOffIcon, TrashIcon } from '@lucide/svelte';
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

		if (page.params.chatId === chat._id) await goto('/');
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
					class="group/menu-button hover:bg-accent data-[active=true]:bg-accent relative flex h-auto flex-col place-items-start! gap-1! truncate rounded-md px-2 py-2"
					onpointerover={() => {
						warm(client, api.chat.get, {
							chatId: chat._id,
						});
					}}
				>
					<Rename.Root
						this="span"
						value={chat.title}
						class="max-w-full rounded-none border-none outline-none focus:ring-0! data-[mode=view]:truncate"
						fallbackSelectionBehavior="all"
						onSave={renameChat}
						bind:mode={renamingMode}
					/>
					<div
						class={cn(
							'border-border absolute right-0 top-0 rounded-bl-md rounded-tr-md border-b border-l',
							'opacity-0 transition-opacity duration-75',
							{
								'opacity-100': chat.generating && renamingMode === 'view',
								'group-hover/menu-button:opacity-100': renamingMode === 'view'
							},
							backgroundClass
						)}
					>
						<div class="flex place-items-center">
							<div
								class={cn(
									'z-10 flex w-0 place-items-center transition-all duration-75 group-hover/menu-button:w-[64px]',
									{
										'group-hover/menu-button:opacity-100': renamingMode === 'view'
									}
								)}
							>
								<Button
									variant="ghost"
									size="icon"
									tabindex={-1}
									class={cn('size-8', backgroundClass)}
									onclick={(e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										togglePinned();
									}}
								>
									{#if !chat.pinned}
										<PinIcon class="size-3.5!" />
									{:else}
										<PinOffIcon class="size-3.5!" />
									{/if}
								</Button>
								<Button
									variant="ghost"
									size="icon"
									tabindex={-1}
									class={cn('size-8', backgroundClass)}
									onclick={(e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										startDeleteChat(e.shiftKey);
									}}
								>
									<TrashIcon class="size-3.5!" />
								</Button>
							</div>
							{#if chat.generating}
								<div class={cn('z-20 size-8 rounded-bl-md rounded-tr-md', backgroundClass)}>
									<div class="flex h-full w-full animate-spin place-items-center justify-center">
										<LoaderCircle class="size-3.5!" />
									</div>
								</div>
							{/if}
						</div>
					</div>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Rename.Provider>
