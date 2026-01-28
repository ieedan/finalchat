<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import * as Command from '$lib/components/ui/command';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { Debounced } from 'runed';
	import { RiArrowRightLine as ArrowRightIcon } from 'remixicon-svelte';
	import { shortcut } from '$lib/actions/shortcut.svelte';
	import MatchingText from './matching-text.svelte';

	let open = $state(false);
	let search = $state('');

	const searchDebounced = new Debounced(() => search, 50);

	const messages = useQuery(api.chats.search, {
		get query() {
			return searchDebounced.current;
		}
	});

	$inspect(messages.data);
</script>

<svelte:window use:shortcut={{ key: 'k', ctrl: true, callback: () => (open = !open) }} />

<Modal.Root bind:open>
	<Modal.Content class="p-0 h-[300px]" hideClose>
		<Command.Root shouldFilter={false}>
			<Command.Input wrapperClass="h-12" class="h-12" placeholder="Search..." bind:value={search} />
			<Command.List>
				{#if !messages.isLoading}
					<Command.Empty>No results found</Command.Empty>
				{/if}
				<Command.Group>
					{#each messages.data ?? [] as result (result.chat._id)}
						<Command.Item
							value={result.chat._id}
							class="flex items-center justify-between py-2 px-4"
						>
							<div class="flex items-start flex-col gap-0.5 flex-1">
								<span class="text-foreground">
									<MatchingText text={result.chat.title} {search} />
								</span>
								<span class="text-muted-foreground">
									{result.messages.length > 0
										? result.messages.length + ' messages'
										: 'No messages'}
								</span>
							</div>
							<ArrowRightIcon />
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Modal.Content>
</Modal.Root>
