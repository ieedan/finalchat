import type { ToolCallPart, ReasoningOutput, TextPart, ToolResultPart, ModelMessage } from 'ai';
import { type Result, ok, err } from 'nevereverthrow';

export const PROTOCOL_VERSION = 'v1';

export function createChunkAppender({ append }: { append: (chunk: string) => void }): {
	append: (chunk: TextPart | ReasoningOutput | ToolCallPart | ToolResultPart) => void;
} {
	let firstChunk = true;
	return {
		append: (chunk: TextPart | ReasoningOutput | ToolCallPart | ToolResultPart) => {
			appendChunk({ chunk, append, firstChunk });
			firstChunk = false;
		}
	};
}

function appendChunk({
	chunk,
	append,
	firstChunk
}: {
	chunk: TextPart | ReasoningOutput | ToolCallPart | ToolResultPart;
	append: (chunk: string) => void;
	firstChunk: boolean;
}) {
	const serialized = serializeChunk(chunk, firstChunk);
	append(serialized);
}

const typeMap = {
	text: 'td',
	reasoning: 'rd',
	'tool-call': 'tc',
	'tool-result': 'tr'
} as const satisfies Record<
	TextPart['type'] | ReasoningOutput['type'] | ToolCallPart['type'] | ToolResultPart['type'],
	string
>;

const reverseTypeMap = Object.fromEntries(
	Object.entries(typeMap).map(([key, val]) => [val, key])
) as Record<(typeof typeMap)[keyof typeof typeMap], keyof typeof typeMap>;

type ProtocolChunkType = (typeof typeMap)[keyof typeof typeMap];

export function serializeChunk(
	chunk: TextPart | ReasoningOutput | ToolCallPart | ToolResultPart,
	firstChunk: boolean
) {
	const t = typeMap[chunk.type];

	if (chunk.type === 'text' || chunk.type === 'reasoning') {
		return createChunk(t, chunk.text.length, chunk.text, firstChunk);
	}

	const chunkData = chunk;
	// we don't want to expose this to the client
	delete chunkData.providerOptions;
	const chunkStr = JSON.stringify(chunkData);
	return createChunk(t, chunkStr.length, chunkStr, firstChunk);
}

function createChunk(
	type: (typeof typeMap)[keyof typeof typeMap],
	chunkLength: number,
	chunk: string,
	firstChunk: boolean
) {
	return `${firstChunk ? `${PROTOCOL_VERSION}:` : ''}${type}${chunkLength}:${chunk}`;
}

export type StreamResult = (TextPart | ReasoningOutput | ToolCallPart | ToolResultPart)[];

class DeserializeStreamError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DeserializeStreamError';
	}
}

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
		text = text.slice(firstColonIndex + 1);
	}

	if (version === null) return err(new DeserializeStreamError('Broken protocol: No version found'));

	const protocolType = text.slice(0, 2) as ProtocolChunkType;
	const chunkType = reverseTypeMap[protocolType];

	const nextColonIndex = text.indexOf(':');
	// broken protocol we cannot continue
	if (nextColonIndex === -1)
		return err(new DeserializeStreamError('Broken protocol: No colon found'));

	let chunkLength: number;
	try {
		chunkLength = parseInt(text.slice(2, nextColonIndex));
	} catch {
		return err(new DeserializeStreamError('Broken protocol: Error parsing chunk length'));
	}

	const chunkText = text.slice(nextColonIndex + 1, nextColonIndex + 1 + chunkLength);
	if (chunkType === 'text') {
		const lastChunk = stack[stack.length - 1];
		// if the last chunk is the same type as the current chunk we just append the text to the last chunk since this isn't a separate part
		if (lastChunk && lastChunk.type === 'text') {
			stack[stack.length - 1] = { ...lastChunk, text: lastChunk.text + chunkText };
		} else {
			stack = [...stack, { type: 'text', text: chunkText }];
		}
	} else if (chunkType === 'reasoning') {
		if (chunkText !== '[REDACTED]') {
			const lastChunk = stack[stack.length - 1];
			// if the last chunk is the same type as the current chunk we just append the text to the last chunk since this isn't a separate part
			if (lastChunk && lastChunk.type === 'reasoning') {
				stack[stack.length - 1] = { ...lastChunk, text: lastChunk.text + chunkText };
			} else {
				stack = [...stack, { type: 'reasoning', text: chunkText }];
			}
		}
	} else if (chunkType === 'tool-call' || chunkType === 'tool-result') {
		try {
			const chunkData = JSON.parse(chunkText) as ToolCallPart | ToolResultPart;
			stack = [...stack, chunkData];
		} catch {
			return err(new DeserializeStreamError('Broken protocol: Error parsing tool call or result'));
		}
	} else {
		return err(new DeserializeStreamError('Broken protocol: Unknown chunk type'));
	}

	const remainingText = text.slice(nextColonIndex + 1 + chunkLength);
	if (remainingText.length === 0) return ok({ stack, remainingText: null, version });

	const nextResult = deserializeStream({ text: remainingText, stack, isFirstChunk: false, version });
	if (nextResult.isOk()) return nextResult;
	// return partial stream
	return ok({ stack, remainingText: null, version });
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
