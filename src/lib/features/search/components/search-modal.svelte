<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import * as Command from '$lib/components/ui/command';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { Debounced } from 'runed';
	import { RiArrowRightLine as ArrowRightIcon } from 'remixicon-svelte';
	import { shortcut } from '$lib/actions/shortcut.svelte';
	import { goto } from '$app/navigation';
	import MatchedText from './matched-text.svelte';
	import { RiChatNewLine as MessagePlusIcon } from 'remixicon-svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let open = $state(false);
	let search = $state('');

	const searchDebounced = new Debounced(() => search, 150);

	const messagesQuery = useQuery(api.chats.search, {
		get query() {
			return searchDebounced.current;
		}
	});
</script>

<svelte:window use:shortcut={{ key: 'k', ctrl: true, callback: () => (open = !open) }} />

<Modal.Root bind:open>
	<Modal.Content class="p-0 h-[300px]" hideClose>
		<Command.Root shouldFilter={false}>
			<Command.Input wrapperClass="h-12" class="h-12" placeholder="Search..." bind:value={search} />
			<Command.List>
				{#if !messagesQuery.isLoading && !searchDebounced.pending}
					<Command.Group>
						{#if !messagesQuery.isLoading && messagesQuery.data?.length === 0}
							<Command.Item
								class="py-2 px-4 flex items-center justify-between"
								onSelect={() => {
									goto(`/chat?q=${search}`);
									open = false;
									search = '';
								}}
							>
								<div class="flex items-center gap-2">
									<MessagePlusIcon class="inline size-4" />
									Create new chat
									<span class="text-muted-foreground">
										{search}
									</span>
								</div>
								<ArrowRightIcon />
							</Command.Item>
						{/if}
						{#each messagesQuery.data ?? [] as result (result._id)}
							<Command.Item
								value={result._id}
								class="flex items-center justify-between py-2 px-4"
								onSelect={() => {
									goto(`/chat/${result._id}`);
									open = false;
									search = '';
								}}
							>
								<div class="flex items-start flex-col gap-0.5 flex-1">
									<MatchedText class="text-foreground" match={result.matchedTitle} />
									{#if result.matchedMessage}
										<MatchedText class="text-muted-foreground" match={result.matchedMessage} />
									{/if}
								</div>
								<ArrowRightIcon />
							</Command.Item>
						{/each}
					</Command.Group>
				{:else}
					<Command.Group>
						{#each Array(3) as _, i (i)}
							<Command.Item class="flex h-14.5 items-center justify-between py-2 px-4" disabled>
								<div class="flex items-start flex-col gap-0.5 flex-1">
									<Skeleton class="h-4 w-3/4" />
									<Skeleton class="h-3 w-1/2 mt-1" />
								</div>
								<Skeleton class="h-4 w-4 rounded" />
							</Command.Item>
						{/each}
					</Command.Group>
				{/if}
			</Command.List>
		</Command.Root>
	</Modal.Content>
</Modal.Root>
