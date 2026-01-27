<script lang="ts">
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import type { ToolCallPart, ToolResultPart } from 'ai';
	import { RiBookAiLine as BookReadIcon } from 'remixicon-svelte';

	type Props = {
		tool: ToolCallPart & {
			result: ToolResultPart | undefined;
		};
	};

	let { tool }: Props = $props();
</script>

<div class="pb-2 max-w-full">
	{#if tool.toolName === 'fetchLinkContent'}
		{@const link = (tool.input as { link: string }).link}
		<div class="py-2">
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
				<ShinyText>
					<span class="font-medium">Reading</span>
					{link}...
				</ShinyText>
			{/if}
		</div>
	{:else}{/if}
</div>
