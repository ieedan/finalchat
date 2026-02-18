import type { ToolCallPart, ToolResultPart } from 'ai';
import type { StreamResult } from '$lib/utils/stream-transport-protocol';

type MarkdownAttachment = {
	key: string;
	mediaType: string;
	url: string;
};

type MarkdownUserMessage = {
	role: 'user';
	content: string;
	attachments: MarkdownAttachment[];
};

type MarkdownAssistantMessage = {
	role: 'assistant';
	parts: StreamResult;
	attachments: MarkdownAttachment[];
	error?: string;
	meta?: {
		stoppedGenerating?: number;
	};
};

export type MarkdownMessage = MarkdownUserMessage | MarkdownAssistantMessage;

export type MarkdownConversation = {
	_id: string;
	title: string;
	messages: MarkdownMessage[];
};

const MESSAGE_SEPARATOR = '\n\n---\n\n';

export function renderConversationMarkdown(chat: MarkdownConversation): string {
	const header = [`# ${chat.title}`, `> Messages: ${chat.messages.length}`].join('\n\n');

	const messageSections = chat.messages.map((message, index) =>
		renderMessageMarkdown(message, index + 1)
	);

	return [header, ...messageSections].join(MESSAGE_SEPARATOR).trimEnd() + '\n';
}

export function createMarkdownFilename(title: string, chatId: string): string {
	const safeTitle = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64);
	const safeChatId = chatId.replace(/[^a-zA-Z0-9_-]+/g, '');
	return `${safeTitle || 'conversation'}-${safeChatId || 'chat'}.md`;
}

function renderMessageMarkdown(message: MarkdownMessage, index: number): string {
	if (message.role === 'user') {
		return renderUserMessageMarkdown(message, index);
	}

	return renderAssistantMessageMarkdown(message, index);
}

function renderUserMessageMarkdown(message: MarkdownUserMessage, index: number): string {
	const sections: string[] = [`## ${index}. User`];

	sections.push(message.content.trim() ? message.content : '_No text content._');

	const attachmentSection = renderAttachmentsMarkdown(message.attachments);
	if (attachmentSection) {
		sections.push(attachmentSection);
	}

	return sections.join('\n\n');
}

function renderAssistantMessageMarkdown(message: MarkdownAssistantMessage, index: number): string {
	const sections: string[] = [`## ${index}. Assistant`];

	if (message.error) {
		sections.push(`> Error: ${message.error}`);
	}

	sections.push(...renderAssistantPartsMarkdown(message.parts));

	if (message.parts.length === 0 && !message.error) {
		sections.push(
			message.meta?.stoppedGenerating === undefined
				? '_Response is still generating._'
				: '_No assistant text content._'
		);
	}

	const attachmentSection = renderAttachmentsMarkdown(message.attachments);
	if (attachmentSection) {
		sections.push(attachmentSection);
	}

	return sections.join('\n\n');
}

function renderAssistantPartsMarkdown(parts: StreamResult): string[] {
	const sections: string[] = [];
	const toolResultByCallId = new Map<string, ToolResultPart>();
	const renderedToolResults = new Set<string>();

	for (const part of parts) {
		if (part.type === 'tool-result') {
			toolResultByCallId.set(part.toolCallId, part);
		}
	}

	for (const part of parts) {
		if (part.type === 'text') {
			if (part.text.trim()) {
				sections.push(part.text);
			}
		} else if (part.type === 'reasoning') {
			if (part.text.trim()) {
				sections.push(['### Reasoning', part.text].join('\n\n'));
			}
		} else if (part.type === 'tool-call') {
			const result = toolResultByCallId.get(part.toolCallId);
			if (result) {
				renderedToolResults.add(part.toolCallId);
			}

			sections.push(renderToolCallMarkdown(part, result));
		} else if (part.type === 'tool-result') {
			if (!renderedToolResults.has(part.toolCallId)) {
				sections.push(renderToolResultMarkdown(part));
			}
		}
	}

	return sections;
}

function renderToolCallMarkdown(toolCall: ToolCallPart, result?: ToolResultPart): string {
	const input = formatForCodeBlock(toolCall.input);
	const sections = [
		`### Tool Call: \`${toolCall.toolName}\``,
		`- Tool call ID: \`${toolCall.toolCallId}\``,
		'#### Input',
		createCodeBlock(input.content, input.language)
	];

	if (!result) {
		sections.push('_Tool result pending._');
		return sections.join('\n\n');
	}

	const output = formatForCodeBlock(result.output);
	sections.push('#### Result', createCodeBlock(output.content, output.language));
	return sections.join('\n\n');
}

function renderToolResultMarkdown(result: ToolResultPart): string {
	const output = formatForCodeBlock(result.output);
	return [
		`### Tool Result: \`${result.toolName}\``,
		`- Tool call ID: \`${result.toolCallId}\``,
		'#### Output',
		createCodeBlock(output.content, output.language)
	].join('\n\n');
}

function renderAttachmentsMarkdown(attachments: MarkdownAttachment[]): string | null {
	if (attachments.length === 0) {
		return null;
	}

	const lines: string[] = ['### Attachments'];

	for (const [index, attachment] of attachments.entries()) {
		const label = `Attachment ${index + 1}`;
		if (attachment.mediaType.startsWith('image/')) {
			lines.push(`- ![${label}](${attachment.url})`);
		} else {
			lines.push(`- [${label}](${attachment.url})`);
		}
		lines.push(`  - media type: \`${attachment.mediaType}\``);
		lines.push(`  - key: \`${attachment.key}\``);
	}

	return lines.join('\n');
}

function formatForCodeBlock(value: unknown): { content: string; language?: string } {
	if (typeof value === 'string') {
		return { content: value || '(empty)' };
	}

	if (
		typeof value === 'number' ||
		typeof value === 'boolean' ||
		value === null ||
		value === undefined
	) {
		return { content: String(value) };
	}

	try {
		return {
			content: JSON.stringify(value, null, 2),
			language: 'json'
		};
	} catch {
		return { content: String(value) };
	}
}

function createCodeBlock(content: string, language?: string): string {
	const safeContent = content || '(empty)';
	const tickRuns = safeContent.match(/`+/g);
	const maxTickRun = tickRuns ? Math.max(...tickRuns.map((run) => run.length)) : 0;
	const fence = '`'.repeat(Math.max(3, maxTickRun + 1));
	return `${fence}${language ?? ''}\n${safeContent}\n${fence}`;
}
