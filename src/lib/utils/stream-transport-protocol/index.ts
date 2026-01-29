import { err, type Result } from 'nevereverthrow';
import { DeserializeStreamError, type StreamResult } from './types';
import { deserializeStream as deserializeStreamV1 } from './v1';
import { deserializeStream as deserializeStreamV2, createChunkAppender } from './v2';
import type { ModelMessage, ReasoningOutput, TextPart } from 'ai';

export { createChunkAppender, type StreamResult };

export function deserializeStream({
	text,
	stack = [],
	isFirstChunk = true,
	version = null
}: {
	text: string;
	stack?: StreamResult;
	isFirstChunk?: boolean;
	version?: string | null;
}): Result<
	{ stack: StreamResult; remainingText: string | null; version: string },
	DeserializeStreamError
> {
	if (isFirstChunk) {
		const firstColonIndex = text.indexOf(':');
		if (firstColonIndex === -1)
			return err(new DeserializeStreamError('Broken protocol: No version colon found'));
		version = text.slice(0, firstColonIndex);
	}

	if (version === 'v1') {
		return deserializeStreamV1({ text, stack, isFirstChunk, version });
	} else if (version === 'v2') {
		return deserializeStreamV2({ text, stack, isFirstChunk, version });
	} else {
		throw new DeserializeStreamError(`Unknown version: ${version}`);
	}
}

export function partsToModelMessage(parts: StreamResult): ModelMessage[] {
	const messages: ModelMessage[] = [];

	let currentMessage:
		| {
				role: 'assistant';
				content: (TextPart | ReasoningOutput)[];
		  }
		| undefined = undefined;

	function flushMessage() {
		if (currentMessage) {
			messages.push(currentMessage);
			currentMessage = undefined;
		}
	}

	for (const part of parts) {
		if (part.type === 'tool-result') {
			flushMessage();
			// Ensure output is always an object, not a string
			// If output is a string, wrap it in the expected format
			const output =
				typeof part.output === 'string'
					? { type: 'text' as const, value: part.output }
					: part.output;
			messages.push({
				role: 'tool',
				content: [
					{
						type: 'tool-result',
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						output: output
					}
				]
			} as ModelMessage);
		} else if (part.type === 'tool-call') {
			flushMessage();
			messages.push({
				role: 'assistant',
				content: [
					{
						type: 'tool-call',
						toolName: part.toolName,
						toolCallId: part.toolCallId,
						input: part.input
					}
				]
			});
		} else if (part.type === 'text' || part.type === 'reasoning') {
			flushMessage();
			if (!currentMessage) {
				currentMessage = {
					role: 'assistant',
					content: []
				};
			}

			// just to satisfy the types
			if (part.type === 'text') {
				currentMessage.content.push({
					type: 'text',
					text: part.text
				});
			} else if (part.type === 'reasoning') {
				currentMessage.content.push({
					type: 'reasoning',
					text: part.text
				});
			}
		}
	}

	flushMessage();

	JSON.stringify(messages, null, 2);

	return messages;
}
