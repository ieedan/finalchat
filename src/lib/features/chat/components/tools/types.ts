import type { ToolCallPart, ToolResultPart } from 'ai';
import type { Doc, Id } from '$lib/convex/_generated/dataModel';
import type { SearchResult } from 'exa-js';
import type { MatchedText } from '$lib/utils/full-text-search';

/**
 * Tool-result shape as merged onto the tool-call in chat-tool-part (stream
 * stores executor output on `output`, not always `ToolResultOutput` wrappers).
 */
export type ChatToolResultPart = Omit<ToolResultPart, 'output'> & {
	output: unknown;
};

/** Props passed into chat-tool-part from the assistant message renderer. */
export type ChatTool = ToolCallPart & {
	result: ChatToolResultPart | undefined;
};

export type WebSearchHit = SearchResult<{ text: true }>;

/** Web search tool output; includes server UTC time for grounding "recent" queries. */
export type WebSearchToolOutput = {
	todaysDate: string;
	results: WebSearchHit[];
};

export type ChatSearchHit = {
	_id: Id<'chats'>;
	matchedTitle: MatchedText;
	matchedMessage?: MatchedText;
};

export type FetchLinkContentTool = ChatTool & {
	toolName: 'fetchLinkContent';
	input: { link: string };
};

export type WebSearchTool = ChatTool & {
	toolName: 'webSearch';
	input: { query: string; excludeDomains?: string[] };
	result:
		| (ChatToolResultPart & {
				output: WebSearchToolOutput;
		  })
		| undefined;
};

export type ChatSearchTool = ChatTool & {
	toolName: 'chatSearch';
	input: { query: string; excludeChatIds?: string[] };
	result:
		| (ChatToolResultPart & {
				output: ChatSearchHit[];
		  })
		| undefined;
};

export type GetChatTool = ChatTool & {
	toolName: 'getChat';
	input: { chatId: string };
	result:
		| (ChatToolResultPart & {
				output: Doc<'chats'> | null;
		  })
		| undefined;
};

export type ChatToolUnion = FetchLinkContentTool | WebSearchTool | ChatSearchTool | GetChatTool;
