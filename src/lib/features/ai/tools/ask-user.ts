import { tool } from 'ai';
import { z } from 'zod';

export const askUserQuestion = z.object({
	id: z
		.string()
		.describe('A short unique identifier for this question, used to match it to its answer.'),
	question: z.string().describe('The question to present to the user.'),
	type: z
		.enum(['single-select', 'multi-select'])
		.describe(
			'"single-select" lets the user pick exactly one option; "multi-select" lets them pick any number.'
		),
	options: z
		.array(z.string())
		.min(1)
		.describe('The options the user can choose from. Do NOT include an "Other" option — the UI adds it automatically.')
});

export const askUserInput = z.object({
	questions: z
		.array(askUserQuestion)
		.min(1)
		.describe('One or more questions to ask the user in a single turn. They will all be answered together.')
});

export type AskUserInput = z.infer<typeof askUserInput>;
export type AskUserQuestion = z.infer<typeof askUserQuestion>;

export type AskUserAnswer = {
	questionId: string;
	selected: string[];
	other?: string;
};

export type AskUserOutput = {
	answers: AskUserAnswer[];
};

export const askUser = tool({
	description: `Ask the user one or more questions through an interactive UI and wait for their response.

Use this when you need clarification or a decision from the user before you can continue — e.g. when the request is ambiguous, when there are multiple reasonable paths, or when you need their preferences.

Guidelines:
- You may include multiple questions in a single call; the user will answer them all at once before you continue.
- Each question must have a unique "id" that you will use to correlate with the answer.
- Use "single-select" when one answer makes sense; use "multi-select" when several may apply.
- Do NOT include an "Other" option in "options" — the UI automatically lets the user write a custom answer.
- Keep options short, concrete, and mutually exclusive (for single-select).

After the user responds, you will receive an answer object for every question with their selected options and any custom "other" text.`,
	inputSchema: askUserInput
	// No `execute` — this is a human-in-the-loop tool. The server loop stops on
	// the tool-call (via `hasToolCall('askUser')`) and waits for the user to
	// submit answers, which are then injected as the tool-result on the next
	// generation.
});
