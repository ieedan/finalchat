<script lang="ts">
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import { RiBookAiLine as BookReadIcon } from 'remixicon-svelte';
	import type { FetchLinkContentTool } from './types.js';

	type Props = {
		tool: FetchLinkContentTool;
	};

	let { tool }: Props = $props();

	const link = $derived(tool.input.link);
</script>

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
