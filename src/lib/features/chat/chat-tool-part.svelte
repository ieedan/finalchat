<script lang="ts">
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import type { ToolCallPart } from 'ai';
	import { RiBookAiLine as BookReadIcon } from 'remixicon-svelte';
	import Search2Line from 'remixicon-svelte/icons/search-2-line';
	import BrainIcon from 'remixicon-svelte/icons/brain-line';

	type Props = {
		tool: ToolCallPart & {
			result: unknown | undefined;
		};
	};

	let { tool }: Props = $props();
</script>

<div class="pb-2 max-w-full">
	{#if tool.toolName === 'fetchLinkContent'}
		{@const link = (tool.input as { link: string }).link}
		{#if tool.result}
			<div class="text-muted-foreground text-nowrap flex items-center gap-1.5">
				<BookReadIcon class="size-4 inline shrink-0" />
				<span class="truncate">
					<span class="font-medium">Read</span>
					<a
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-foreground transition-colors">{link}</a
					>
				</span>
			</div>
		{:else}
			<ShinyText class="flex items-center gap-1.5">
				<BookReadIcon class="size-4 inline shrink-0" />
				<span class="font-medium">Reading</span>
				{link}...
			</ShinyText>
		{/if}
	{:else if tool.toolName === 'chatSearch'}
		{#if tool.result}
			<div class="text-muted-foreground text-nowrap flex items-center gap-1.5">
				<Search2Line class="size-4 inline shrink-0" />
				<span class="truncate">
					<span class="font-medium">Found</span>
					{(tool.result as { output: unknown[] }).output.length}
					chats
				</span>
			</div>
		{:else}
			<ShinyText class="flex items-center gap-1.5">
				<Search2Line class="size-4 inline shrink-0" />
				<span class="font-medium">Searching past chats...</span>
			</ShinyText>
		{/if}
	{:else if tool.toolName === 'getChat'}
		{#if tool.result}
			<div class="text-muted-foreground text-nowrap flex items-center gap-1.5">
				<BrainIcon class="size-4 inline shrink-0" />
				<span class="truncate">
					<span class="font-medium">Recalled</span>
					<a
						href={`/chat/${(tool.result as { output: Doc<'chats'> }).output._id}`}
						class="hover:text-foreground transition-colors"
					>
						"{(tool.result as { output: Doc<'chats'> }).output.title}"
					</a>
				</span>
			</div>
		{:else}
			<ShinyText class="flex items-center gap-1.5">
				<BrainIcon class="size-4 inline shrink-0" />
				<span class="font-medium">Recalling chat...</span>
			</ShinyText>
		{/if}
	{/if}
</div>
