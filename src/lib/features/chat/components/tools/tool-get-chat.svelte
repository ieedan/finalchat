<script lang="ts">
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import BrainIcon from 'remixicon-svelte/icons/brain-line';
	import type { GetChatTool } from './types.js';

	type Props = {
		tool: GetChatTool;
	};

	let { tool }: Props = $props();

	const chat = $derived(tool.result?.output ?? null);
</script>

{#if tool.result}
	{#if chat}
		<div class="text-muted-foreground text-nowrap flex items-center gap-1.5">
			<BrainIcon class="size-4 inline shrink-0" />
			<span class="truncate">
				<span class="font-medium">Recalled</span>
				<a href="/chat/{chat._id}" class="hover:text-foreground transition-colors">
					"{chat.title}"
				</a>
			</span>
		</div>
	{:else}
		<div class="text-muted-foreground text-nowrap flex items-center gap-1.5">
			<BrainIcon class="size-4 inline shrink-0" />
			<span class="truncate">Chat not found</span>
		</div>
	{/if}
{:else}
	<ShinyText class="flex items-center gap-1.5">
		<BrainIcon class="size-4 inline shrink-0" />
		<span class="font-medium">Recalling chat...</span>
	</ShinyText>
{/if}
