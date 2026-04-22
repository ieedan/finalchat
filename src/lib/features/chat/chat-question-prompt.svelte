<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import CheckIcon from 'remixicon-svelte/icons/check-line';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { ConvexError } from 'convex/values';
	import { cn } from '$lib/utils';
	import { useChatLayout } from './chat.svelte.js';
	import type { AskUserAnswer, AskUserQuestion } from '$lib/features/ai/tools/ask-user';
	import { tick } from 'svelte';
	import { TextareaAutosize } from 'runed';

	type Props = {
		messageId: Id<'messages'>;
		questions: AskUserQuestion[];
	};

	let { messageId, questions }: Props = $props();

	// Sentinel value stored in `draft.selected` when the user chose the free-form
	// "Other" option on a select-type question. Filtered out before submitting.
	const OTHER_VALUE = '__other__';

	const convex = useConvexClient();
	const chatLayout = useChatLayout();

	type Draft = { selected: string[]; other: string };
	let drafts = $state<Record<string, Draft>>({});

	function getDraft(questionId: string): Draft {
		return drafts[questionId] ?? { selected: [], other: '' };
	}

	let currentIndex = $state(0);
	let textInputRef = $state<HTMLTextAreaElement | null>(null);

	const activeQuestion = $derived<AskUserQuestion | undefined>(questions[currentIndex]);
	const isLast = $derived(currentIndex === questions.length - 1);
	const isFirst = $derived(currentIndex === 0);

	// Auto-grow the free-form textarea (used both by "text" questions and by
	// the "Other" row on select questions that opt in with `allowCustom`).
	new TextareaAutosize({
		element: () => textInputRef ?? undefined,
		input: () => (activeQuestion ? getDraft(activeQuestion.id).other : ''),
		maxHeight: 160
	});

	function isValid(q: AskUserQuestion, draft: Draft): boolean {
		if (q.type === 'text') {
			if (q.optional) return true;
			return draft.other.trim().length > 0;
		}
		if (draft.selected.length === 0) return !!q.optional;
		// If the user picked the "Other" option they still owe us the custom text.
		if (draft.selected.includes(OTHER_VALUE) && draft.other.trim().length === 0) return false;
		return true;
	}

	const activeIsValid = $derived(
		activeQuestion ? isValid(activeQuestion, getDraft(activeQuestion.id)) : false
	);
	const allValid = $derived(questions.every((q) => isValid(q, getDraft(q.id))));

	let submitting = $state(false);
	let submitError = $state<string | null>(null);

	function isSelected(questionId: string, value: string) {
		return getDraft(questionId).selected.includes(value);
	}

	function toggleMulti(questionId: string, value: string, checked: boolean) {
		const draft = getDraft(questionId);
		const without = draft.selected.filter((v) => v !== value);
		drafts[questionId] = { ...draft, selected: checked ? [...without, value] : without };
	}

	function setSingle(questionId: string, value: string) {
		const draft = getDraft(questionId);
		drafts[questionId] = { ...draft, selected: [value] };
	}

	function setOtherText(questionId: string, text: string) {
		const draft = getDraft(questionId);
		drafts[questionId] = { ...draft, other: text };
	}

	function pickOption(q: AskUserQuestion, option: string) {
		if (q.type === 'single-select') {
			setSingle(q.id, option);
			// Auto-advance on picking a concrete option. "Other" is handled
			// separately because it needs follow-up text input on the same row.
			if (!isLast) currentIndex++;
		} else if (q.type === 'multi-select') {
			toggleMulti(q.id, option, !isSelected(q.id, option));
		}
	}

	async function pickOther(q: AskUserQuestion) {
		const currentlySelected = isSelected(q.id, OTHER_VALUE);
		if (q.type === 'single-select') {
			if (currentlySelected) return;
			setSingle(q.id, OTHER_VALUE);
		} else if (q.type === 'multi-select') {
			toggleMulti(q.id, OTHER_VALUE, !currentlySelected);
		}
		// Focus the inline text input once it appears.
		await tick();
		textInputRef?.focus();
	}

	function goNext() {
		if (!activeIsValid || isLast) return;
		currentIndex++;
	}

	function goPrevious() {
		if (isFirst) return;
		currentIndex--;
	}

	async function submit() {
		if (!allValid || submitting) return;
		submitting = true;
		submitError = null;
		try {
			const payload: AskUserAnswer[] = questions.map((q) => {
				const draft = getDraft(q.id);
				if (q.type === 'text') {
					const text = draft.other.trim();
					return { questionId: q.id, selected: [], ...(text ? { other: text } : {}) };
				}
				const pickedOther = draft.selected.includes(OTHER_VALUE);
				const selected = draft.selected.filter((v) => v !== OTHER_VALUE);
				return {
					questionId: q.id,
					selected,
					...(pickedOther ? { other: draft.other.trim() } : {})
				};
			});

			const { assistantMessageId } = await convex.mutation(api.messages.submitQuestionAnswers, {
				messageId,
				answers: payload
			});

			chatLayout.createdMessages.add(assistantMessageId);
		} catch (error) {
			submitError =
				error instanceof ConvexError
					? (error.data as string)
					: error instanceof Error
						? error.message
						: 'Failed to submit answers';
			submitting = false;
		}
	}

	function handleTextareaKeydown(e: KeyboardEvent) {
		// Don't let keystrokes bubble into outer row keyhandlers (which toggle
		// selection). Enter advances/submits; Shift+Enter inserts a newline.
		e.stopPropagation();
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (submitting) return;
			if (isLast) {
				if (allValid) submit();
			} else if (activeIsValid) {
				goNext();
			}
		}
	}

	function optionClass(selected: boolean) {
		return cn(
			// Base button-like layout and a11y states, lifted from buttonVariants
			// so we get the same focus ring / disabled behavior as other controls.
			'relative inline-flex w-full items-start justify-start gap-3 rounded-md border text-sm font-medium transition-all whitespace-normal text-left',
			// py-3 + leading-5 content = 44px min height (= min-h-11) so a
			// single-line row is still row-centered. When a textarea inside the
			// row grows, items-start keeps the indicator anchored to the first
			// line rather than drifting to the vertical middle.
			'min-h-11 h-auto px-3 py-3 leading-5',
			'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
			'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
			'[&_svg]:pointer-events-none [&_svg]:shrink-0',
			selected
				? 'bg-primary/40 text-white border-primary/40 ring-1 ring-primary/20 hover:bg-primary/50'
				: 'bg-muted/40 text-foreground border-border hover:bg-muted hover:border-foreground/10'
		);
	}

	// With items-start, a bare size-4 indicator sits 2px above the visual
	// center of a leading-5 line. A 2px top-margin puts it on the first line.
	const indicatorAlign = 'mt-0.5';
</script>

<div
	data-slot="chat-question-prompt"
	class="relative z-20 border border-border rounded-xl bg-background shadow-sm overflow-hidden"
>
	{#if activeQuestion}
		{@const q = activeQuestion}
		{@const draft = getDraft(q.id)}
		<div class="px-4 pt-4 pb-3 flex flex-col gap-3 min-w-0">
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-sm font-medium text-foreground min-w-0 wrap-break-word">
					{q.question}
					{#if q.optional}
						<span class="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
					{/if}
				</h3>
				{#if questions.length > 1}
					<span class="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
						{currentIndex + 1} / {questions.length}
					</span>
				{/if}
			</div>

			{#if q.type === 'text'}
				<textarea
					bind:this={textInputRef}
					rows="1"
					placeholder="Type your answer..."
					value={draft.other}
					disabled={submitting}
					onkeydown={handleTextareaKeydown}
					oninput={(e) => setOtherText(q.id, (e.currentTarget as HTMLTextAreaElement).value)}
					class={cn(
						'w-full resize-none rounded-md border bg-muted/40 text-foreground transition-colors',
						'px-3 py-3 leading-5 text-sm placeholder:text-muted-foreground',
						'border-border hover:border-foreground/20',
						'focus:outline-none focus:ring-[3px] focus:ring-ring/50 focus:border-ring',
						'disabled:pointer-events-none disabled:opacity-50'
					)}
				></textarea>
			{:else}
				<div class="flex flex-col gap-1.5">
					{#each q.options ?? [] as option, i (i)}
						{@const selected = isSelected(q.id, option)}
						<button
							type="button"
							disabled={submitting}
							class={optionClass(selected)}
							onclick={() => pickOption(q, option)}
						>
							<span
								aria-hidden="true"
								class={cn(
									'flex items-center justify-center size-4 shrink-0 border',
									indicatorAlign,
									q.type === 'single-select'
										? 'rounded-full border-input bg-background'
										: cn(
												'rounded-[4px]',
												selected
													? 'bg-primary border-primary'
													: 'border-input bg-background'
											)
								)}
							>
								{#if selected}
									{#if q.type === 'single-select'}
										<span class="size-2 rounded-full bg-primary"></span>
									{:else}
										<CheckIcon class="size-3 text-primary-foreground" />
									{/if}
								{/if}
							</span>
							<span class="flex-1 min-w-0">{option}</span>
						</button>
					{/each}

					{#if q.allowCustom}
						{@const otherSelected = isSelected(q.id, OTHER_VALUE)}
						<div
							role="button"
							tabindex={submitting ? -1 : 0}
							aria-pressed={otherSelected}
							aria-disabled={submitting}
							class={optionClass(otherSelected)}
							onclick={() => !submitting && pickOther(q)}
							onkeydown={(e) => {
								// Only react to key events originating on the div itself —
								// keystrokes inside the textarea bubble up here and we don't
								// want them to toggle selection.
								if (e.target !== e.currentTarget) return;
								if (submitting) return;
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									pickOther(q);
								}
							}}
						>
							<span
								aria-hidden="true"
								class={cn(
									'flex items-center justify-center size-4 shrink-0 border',
									indicatorAlign,
									q.type === 'single-select'
										? 'rounded-full border-input bg-background'
										: cn(
												'rounded-[4px]',
												otherSelected
													? 'bg-primary border-primary'
													: 'border-input bg-background'
											)
								)}
							>
								{#if otherSelected}
									{#if q.type === 'single-select'}
										<span class="size-2 rounded-full bg-primary"></span>
									{:else}
										<CheckIcon class="size-3 text-primary-foreground" />
									{/if}
								{/if}
							</span>
							{#if otherSelected}
								<textarea
									bind:this={textInputRef}
									rows="1"
									placeholder="Type your answer..."
									value={draft.other}
									disabled={submitting}
									onclick={(e) => e.stopPropagation()}
									onkeydown={handleTextareaKeydown}
									oninput={(e) =>
										setOtherText(q.id, (e.currentTarget as HTMLTextAreaElement).value)}
									class="flex-1 min-w-0 resize-none bg-transparent outline-none placeholder:text-muted-foreground p-0 leading-5"
								></textarea>
							{:else}
								<span class="flex-1 min-w-0">Other</span>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			{#if submitError}
				<p class="text-destructive text-xs">{submitError}</p>
			{/if}
		</div>

		<div
			class="flex items-center justify-between gap-2 px-3 py-2 border-t border-border bg-muted/20"
		>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				disabled={isFirst || submitting}
				onclick={goPrevious}
			>
				Back
			</Button>
			{#if isLast}
				<Button
					type="button"
					size="sm"
					disabled={!allValid || submitting}
					loading={submitting}
					onclick={submit}
				>
					Submit answers
				</Button>
			{:else}
				<Button type="button" size="sm" disabled={!activeIsValid || submitting} onclick={goNext}>
					Next
				</Button>
			{/if}
		</div>
	{/if}
</div>
