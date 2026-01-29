import { describe, it, expect, vi, assert } from 'vitest';
import { deserializeStream } from './index';
import { createChunkAppender as createChunkAppenderV1 } from './v1';
import { createChunkAppender as createChunkAppenderV2 } from './v2';
import type { ToolCallPart, ToolResultPart } from 'ai';
import type { StreamResult } from './types';

const versions = [
	{ version: 'v1', createChunkAppender: createChunkAppenderV1 },
	{ version: 'v2', createChunkAppender: createChunkAppenderV2 }
];

describe('stream transport protocol index', () => {
	describe.each(versions)('$version stream deserialization', ({ version, createChunkAppender }) => {
		it(`should deserialize ${version} stream correctly`, () => {
			let serializedContent = '';

			const append = vi.fn((chunk: string) => {
				serializedContent += chunk;
			});

			const appender = createChunkAppender({ append });

			const toolCall: ToolCallPart = {
				type: 'tool-call',
				toolName: 'fetchLinkContent',
				toolCallId: '123',
				input: { url: 'https://www.google.com' }
			};

			const toolResult: ToolResultPart = {
				type: 'tool-result',
				toolName: 'fetchLinkContent',
				toolCallId: '123',
				output: {
					type: 'text',
					value: 'This is a tool result'
				}
			};

			const partStack: StreamResult = [
				{ type: 'text', text: 'Hello,' },
				{ type: 'text', text: ' World!' },
				{ type: 'reasoning', text: 'This is a reasoning chunk' },
				{ type: 'text', text: 'Nice!' },
				{ type: 'text', text: ' Ok now I will do this,' },
				toolCall,
				toolResult
			];

			for (const part of partStack) {
				appender.append(part);
			}

			const result = deserializeStream({ text: serializedContent, stack: [] });
			assert(result.isOk());

			expect(result.value.version).toBe(version);
			expect(result.value.remainingText).toBeNull();

			expect(result.value.stack).toStrictEqual([
				// will collapse adjacent text chunks
				{ type: 'text', text: 'Hello, World!' },
				{ type: 'reasoning', text: 'This is a reasoning chunk' },
				{ type: 'text', text: 'Nice! Ok now I will do this,' },
				toolCall,
				toolResult
			]);
		});
	});
});
