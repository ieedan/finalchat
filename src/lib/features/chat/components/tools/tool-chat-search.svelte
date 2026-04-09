<script lang="ts">
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import Search2Line from 'remixicon-svelte/icons/search-2-line';
	import type { ChatSearchTool } from './types.js';

	type Props = {
		tool: ChatSearchTool;
	};

	let { tool }: Props = $props();
</script>

{#if tool.result}
	<div class="text-muted-foreground text-nowrap flex items-center gap-1.5">
		<Search2Line class="size-4 inline shrink-0" />
		<span class="truncate">
			<span class="font-medium">Found</span>
			{tool.result?.output.length ?? 0}
			chats
		</span>
	</div>
{:else}
	<ShinyText class="flex items-center gap-1.5">
		<Search2Line class="size-4 inline shrink-0" />
		<span class="font-medium">Searching past chats...</span>
	</ShinyText>
{/if}
