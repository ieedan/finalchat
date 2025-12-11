<script lang="ts">
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import type { ToolCallPart, ToolResultPart } from 'ai';
	import BookOpenCheckIcon from '@lucide/svelte/icons/book-open-check';

	type Props = {
		tool: ToolCallPart & {
			result: ToolResultPart | undefined;
		};
	};

	let { tool }: Props = $props();
</script>

<div class="pb-2">
	{#if tool.toolName === 'fetchLinkContent'}
		{@const link = (tool.input as { link: string }).link}
		<div class="py-2">
			{#if tool.result}
				<div class="flex items-center gap-2 text-muted-foreground">
					<BookOpenCheckIcon class="size-4" />
					Read {link}
				</div>
			{:else}
				<ShinyText>
					Reading {link}...
				</ShinyText>
			{/if}
		</div>
	{:else}{/if}
</div>
