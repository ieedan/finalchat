<script lang="ts">
	import QuestionIcon from 'remixicon-svelte/icons/questionnaire-line';
	import CheckIcon from 'remixicon-svelte/icons/check-line';
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import { useChatView } from '../../chat.svelte.js';
	import type { AskUserTool } from './types.js';
	import type { AskUserAnswer, AskUserQuestion } from '$lib/features/ai/tools/ask-user';

	type Props = {
		tool: AskUserTool;
	};

	let { tool }: Props = $props();

	const chatView = useChatView();

	const questions = $derived<AskUserQuestion[]>(tool.input?.questions ?? []);
	const isAnswered = $derived(tool.result !== undefined);
	const answers = $derived<AskUserAnswer[]>(tool.result?.output?.answers ?? []);

	function answerFor(questionId: string): AskUserAnswer | undefined {
		return answers.find((a) => a.questionId === questionId);
	}
</script>

{#if !isAnswered}
	{#if chatView.chat?.generating}
		<ShinyText class="flex items-center gap-1.5">
			<QuestionIcon class="size-3.5 shrink-0" />
			<span class="font-medium">Preparing question{questions.length === 1 ? '' : 's'}...</span>
		</ShinyText>
	{:else}
		<div class="text-muted-foreground flex items-center gap-1.5">
			<QuestionIcon class="size-3.5 shrink-0" />
			<span>Waiting for your answer below.</span>
		</div>
	{/if}
{:else}
	<div class="border border-border rounded-md bg-background overflow-hidden">
		<div
			class="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground"
		>
			<CheckIcon class="size-3.5" />
			<span>Answered {questions.length} question{questions.length === 1 ? '' : 's'}</span>
		</div>
		<dl class="flex flex-col gap-3 p-3 text-sm">
			{#each questions as q (q.id)}
				{@const a = answerFor(q.id)}
				<div class="flex flex-col gap-1 min-w-0">
					<dt class="font-medium text-foreground">{q.question}</dt>
					<dd class="flex flex-col gap-1.5 text-muted-foreground">
						{#if a}
							{#if q.type === 'text'}
								{#if a.other}
									<p class="text-foreground whitespace-pre-wrap break-words">{a.other}</p>
								{:else}
									<span class="italic">No answer recorded</span>
								{/if}
							{:else}
								<div class="flex flex-wrap gap-1.5">
									{#each a.selected as s (s)}
										<span
											class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground"
										>
											<CheckIcon class="size-3" />
											{s}
										</span>
									{/each}
									{#if a.other}
										<span
											class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground"
										>
											<CheckIcon class="size-3" />
											Other: {a.other}
										</span>
									{/if}
									{#if a.selected.length === 0 && !a.other}
										<span class="italic">No answer recorded</span>
									{/if}
								</div>
							{/if}
						{:else}
							<span class="italic">No answer recorded</span>
						{/if}
					</dd>
				</div>
			{/each}
		</dl>
	</div>
{/if}
