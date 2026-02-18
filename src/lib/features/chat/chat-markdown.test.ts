import { describe, it, expect } from 'vitest';
import {
	createMarkdownFilename,
	renderConversationMarkdown,
	type MarkdownConversation
} from './chat-markdown';
import type { ToolCallPart, ToolResultPart } from 'ai';

describe('chat markdown formatter', () => {
	it('renders user and assistant messages with attachments and tool calls', () => {
		const toolCall: ToolCallPart = {
			type: 'tool-call',
			toolName: 'fetchLinkContent',
			toolCallId: 'tool-1',
			input: {
				link: 'https://example.com'
			}
		};

		const toolResult: ToolResultPart = {
			type: 'tool-result',
			toolName: 'fetchLinkContent',
			toolCallId: 'tool-1',
			output: {
				type: 'text',
				value: '# Example content'
			}
		};

		const chat: MarkdownConversation = {
			_id: 'chat_123',
			title: 'Tooling and Attachments',
			messages: [
				{
					role: 'user',
					content: 'Please summarize this website.',
					attachments: [
						{
							key: 'user-image.png',
							mediaType: 'image/png',
							url: 'https://files.example.com/user-image.png'
						}
					]
				},
				{
					role: 'assistant',
					parts: [
						{
							type: 'text',
							text: 'I will open the link and summarize it.'
						},
						toolCall,
						toolResult,
						{
							type: 'text',
							text: 'Summary: this is example content.'
						}
					],
					attachments: [
						{
							key: 'assistant-image.png',
							mediaType: 'image/png',
							url: 'https://files.example.com/assistant-image.png'
						}
					],
					meta: {
						stoppedGenerating: Date.now()
					}
				}
			]
		};

		const markdown = renderConversationMarkdown(chat);

		expect(markdown).toContain('# Tooling and Attachments');
		expect(markdown).toContain('## 1. User');
		expect(markdown).toContain('## 2. Assistant');
		expect(markdown).toContain('### Tool Call: `fetchLinkContent`');
		expect(markdown).toContain('#### Input');
		expect(markdown).toContain('"link": "https://example.com"');
		expect(markdown).toContain('#### Result');
		expect(markdown).toContain('"value": "# Example content"');
		expect(markdown).toContain(
			'![Attachment 1](https://files.example.com/user-image.png)'
		);
		expect(markdown).toContain(
			'![Attachment 1](https://files.example.com/assistant-image.png)'
		);
	});

	it('renders standalone tool results and generating assistant placeholder text', () => {
		const chat: MarkdownConversation = {
			_id: 'chat_456',
			title: 'Tool results only',
			messages: [
				{
					role: 'assistant',
					parts: [
						{
							type: 'tool-result',
							toolName: 'fetchLinkContent',
							toolCallId: 'tool-2',
							output: {
								type: 'text',
								value: 'Done'
							}
						}
					],
					attachments: [],
					meta: {
						stoppedGenerating: Date.now()
					}
				},
				{
					role: 'assistant',
					parts: [],
					attachments: [],
					meta: {}
				}
			]
		};

		const markdown = renderConversationMarkdown(chat);

		expect(markdown).toContain('### Tool Result: `fetchLinkContent`');
		expect(markdown).toContain('"value": "Done"');
		expect(markdown).toContain('_Response is still generating._');
	});

	it('creates safe markdown filenames', () => {
		expect(createMarkdownFilename('My Great Chat!', 'abc123')).toBe('my-great-chat-abc123.md');
		expect(createMarkdownFilename('***', 'id$%^')).toBe('conversation-id.md');
	});
});
