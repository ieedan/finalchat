import { err, ok, type Result } from 'nevereverthrow';
import { DeserializeStreamError, type StreamResult } from './types';
import { deserializeStream as deserializeStreamV1 } from './v1';
import {
	deserializeStream as deserializeStreamV2,
	createChunkAppender,
	serializeParts
} from './v2';
import type { FilePart, ModelMessage, ReasoningOutput, TextPart, ToolResultPart } from 'ai';

type ToolResultOutput = ToolResultPart['output'];

export { createChunkAppender, type StreamResult, serializeParts };

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

export function partsToModelMessage(
	parts: StreamResult,
	trailingFileParts: FilePart[] = []
): ModelMessage[] {
	const messages: ModelMessage[] = [];

	let currentMessage:
		| {
				role: 'assistant';
				content: (TextPart | ReasoningOutput | FilePart)[];
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
			messages.push({
				role: 'tool',
				content: [
					{
						type: 'tool-result',
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						output: normalizeToolResultOutput(part.output)
					}
				]
			} satisfies ModelMessage);
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

	// Merge assistant-generated files (e.g. images) into the final assistant
	// message so the model sees them as part of that turn. Splitting them into a
	// separate assistant message breaks the user/assistant alternation many
	// providers require and causes the image to be dropped when iterating.
	if (trailingFileParts.length > 0) {
		if (!currentMessage) {
			currentMessage = {
				role: 'assistant',
				content: []
			};
		}
		currentMessage.content.push(...trailingFileParts);
	}

	flushMessage();

	return messages;
}

function normalizeToolResultOutput(raw: unknown): ToolResultOutput {
	if (typeof raw === 'string') {
		return { type: 'text', value: raw };
	}
	if (raw !== null && typeof raw === 'object' && !Array.isArray(raw) && 'type' in raw) {
		const typed = raw as { type: unknown };
		if (
			typed.type === 'text' &&
			'value' in raw &&
			typeof (raw as { value: unknown }).value === 'string'
		) {
			return raw as ToolResultOutput;
		}
		if (typed.type === 'json' && 'value' in raw) {
			return raw as ToolResultOutput;
		}
		if (typed.type === 'execution-denied') {
			return raw as ToolResultOutput;
		}
		if (
			typed.type === 'error-text' &&
			'value' in raw &&
			typeof (raw as { value: unknown }).value === 'string'
		) {
			return raw as ToolResultOutput;
		}
		if (typed.type === 'error-json' && 'value' in raw) {
			return raw as ToolResultOutput;
		}
		if (
			typed.type === 'content' &&
			'value' in raw &&
			Array.isArray((raw as { value: unknown }).value)
		) {
			return raw as ToolResultOutput;
		}
	}
	return {
		type: 'json',
		value: JSON.parse(JSON.stringify(raw)) as Extract<ToolResultOutput, { type: 'json' }>['value']
	};
}

export function repackStream(context: string): Result<string, DeserializeStreamError> {
	const partsResult = deserializeStream({ text: context });
	if (partsResult.isErr()) {
		return err(partsResult.error);
	}

	const parts = partsResult.value.stack;
	return ok(serializeParts(parts));
}
