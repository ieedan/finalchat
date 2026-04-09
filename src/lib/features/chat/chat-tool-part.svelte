<script lang="ts">
	import {
		ToolChatSearch,
		ToolFetchLinkContent,
		ToolGetChat,
		ToolWebSearch,
		type ChatSearchTool,
		type FetchLinkContentTool,
		type GetChatTool,
		type WebSearchTool
	} from './components/tools';
	import type { ChatTool } from './components/tools/types';

	type Props = {
		tool: ChatTool;
	};

	let { tool }: Props = $props();
</script>

<div class="pb-2 max-w-full">
	{#if tool.toolName === 'fetchLinkContent'}
		<ToolFetchLinkContent tool={tool as FetchLinkContentTool} />
	{:else if tool.toolName === 'webSearch'}
		<ToolWebSearch tool={tool as WebSearchTool} />
	{:else if tool.toolName === 'chatSearch'}
		<ToolChatSearch tool={tool as ChatSearchTool} />
	{:else if tool.toolName === 'getChat'}
		<ToolGetChat tool={tool as GetChatTool} />
	{/if}
</div>
