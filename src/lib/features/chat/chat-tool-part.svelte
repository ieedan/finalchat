<script lang="ts">
	import {
		ToolAskUser,
		ToolChatSearch,
		ToolFetchLinkContent,
		ToolGetChat,
		ToolWebSearch,
		type AskUserTool,
		type ChatSearchTool,
		type FetchLinkContentTool,
		type GetChatTool,
		type WebSearchTool
	} from './components/tools';
	import type { ChatTool } from './components/tools/types';
	import { animated } from 'animated-svelte';

	type Props = {
		tool: ChatTool;
		animationEnabled?: boolean;
	};

	let { tool, animationEnabled = true }: Props = $props();
</script>

<animated.div
	initial={animationEnabled ? { opacity: 0, y: 10 } : false}
	animate={{ opacity: 1, y: 0 }}
	exit={{ opacity: 0, y: 10 }}
	transition={{
		duration: animationEnabled ? 0.2 : 0,
		timingFunction: 'ease-out'
	}}
	class="pb-2 max-w-full"
>
	{#if tool.toolName === 'fetchLinkContent'}
		<ToolFetchLinkContent tool={tool as FetchLinkContentTool} />
	{:else if tool.toolName === 'webSearch'}
		<ToolWebSearch tool={tool as WebSearchTool} />
	{:else if tool.toolName === 'chatSearch'}
		<ToolChatSearch tool={tool as ChatSearchTool} />
	{:else if tool.toolName === 'getChat'}
		<ToolGetChat tool={tool as GetChatTool} />
	{:else if tool.toolName === 'askUser'}
		<ToolAskUser tool={tool as AskUserTool} />
	{/if}
</animated.div>
