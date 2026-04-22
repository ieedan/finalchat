import { tool } from 'ai';
import { z } from 'zod';

export const askUserQuestion = z.object({
	id: z
		.string()
		.describe('A short unique identifier for this question, used to match it to its answer.'),
	question: z.string().describe('The question to present to the user.'),
	type: z
		.enum(['single-select', 'multi-select', 'text'])
		.describe(
			'"single-select" lets the user pick exactly one option; "multi-select" lets them pick any number; "text" is a free-form text answer with no options.'
		),
	options: z
		.array(z.string())
		.optional()
		.describe(
			'The options to choose from. Required for "single-select" and "multi-select". Omit for "text".'
		),
	allowCustom: z
		.boolean()
		.optional()
		.describe(
			'For "single-select" and "multi-select" only: when true, the UI also shows a free-form text field (labeled "Other") alongside the options so the user can write their own answer. Defaults to false. Ignored for "text" type.'
		),
	optional: z
		.boolean()
		.optional()
		.describe(
			'When true, the user can submit without answering this question (zero selections for select types, empty text for "text" type). The UI marks it as "(optional)". Defaults to false — i.e. the question is required.'
		)
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
	/** Picked options from `options` (empty for "text" questions or when the user only supplied a custom answer). */
	selected: string[];
	/** The user's free-form text answer (present when `type === "text"` or when `allowCustom` is true and the user wrote something). */
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
- Question types:
  - "single-select": user picks exactly one of the provided "options".
  - "multi-select": user picks any number of the provided "options".
  - "text": user writes a free-form answer — do NOT provide "options" for this type.
- For "single-select" and "multi-select", set "allowCustom: true" if you want the UI to also offer a free-form text field ("Other") alongside the provided options. Leave it off (or false) to restrict the user to the listed options.
- Set "optional: true" on any question the user should be allowed to skip (submit with no answer). Default is required.
- Keep options short, concrete, and mutually exclusive (for single-select).

After the user responds, each answer has:
- "selected": the option strings they picked (empty for text questions, or if they only supplied a custom answer).
- "other": the free-form text they wrote (present for "text" questions, or when "allowCustom" was true and they used the text field).`,
	inputSchema: askUserInput
	// No `execute` — this is a human-in-the-loop tool. The server loop stops on
	// the tool-call (via `hasToolCall('askUser')`) and waits for the user to
	// submit answers, which are then injected as the tool-result on the next
	// generation.
});
