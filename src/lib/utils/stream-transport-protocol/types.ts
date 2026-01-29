import type { ReasoningOutput, ToolCallPart, TextPart, ToolResultPart } from 'ai';

export type StreamResult = (TextPart | ReasoningOutput | ToolCallPart | ToolResultPart)[];

export class DeserializeStreamError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DeserializeStreamError';
	}
}
