<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import * as Command from '$lib/components/ui/command';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { Debounced } from 'runed';
	import { RiArrowRightLine as ArrowRightIcon } from 'remixicon-svelte';
	import { shortcut } from '$lib/actions/shortcut.svelte';
	import MatchingText from './matching-text.svelte';
	import removeMarkdown from 'remove-markdown';
	import type { StreamResult } from '$lib/utils/stream-transport-protocol';

	let open = $state(false);
	let search = $state('');

	const searchDebounced = new Debounced(() => search, 50);

	const messages = useQuery(api.chats.search, {
		get query() {
			return searchDebounced.current;
		}
	});

	function getMatchingMessageText(
		message: { role: 'user' | 'assistant'; content?: string | null; parts?: StreamResult },
		searchQuery: string
	): string | null {
		if (!message) return null;

		const queryLower = searchQuery.toLowerCase();

		if (message.role === 'user') {
			const content = message.content || '';
			const plainText = removeMarkdown(content);
			// Since the message matched the search, show the content
			return plainText;
		}

		// For assistant messages, find the first text or reasoning part that matches
		if (message.role === 'assistant' && message.parts) {
			for (const part of message.parts) {
				if (part.type === 'text' || part.type === 'reasoning') {
					const plainText = removeMarkdown(part.text);
					// Check if this part contains the search query
					if (plainText.toLowerCase().includes(queryLower)) {
						return plainText;
					}
				}
			}
			// If no part matches, show the first text/reasoning part anyway
			for (const part of message.parts) {
				if (part.type === 'text' || part.type === 'reasoning') {
					return removeMarkdown(part.text);
				}
			}
		}

		return null;
	}
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
								{#if result.messages.length > 0}
									{@const firstMessage = result.messages[0]}
									{@const matchingText = getMatchingMessageText(firstMessage, search)}
									{#if matchingText}
										<span class="text-muted-foreground text-sm line-clamp-1">
											<MatchingText text={matchingText} {search} maxLength={80} />
										</span>
									{:else}
										<span class="text-muted-foreground">
											{result.messages.length} {result.messages.length === 1 ? 'message' : 'messages'}
										</span>
									{/if}
								{:else}
									<span class="text-muted-foreground">No messages</span>
								{/if}
							</div>
							<ArrowRightIcon />
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Modal.Content>
</Modal.Root>
