<script lang="ts">
	import type { MatchedText } from '$lib/utils/full-text-search';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		match,
		maxLength = 50,
		...restProps
	}: HTMLAttributes<HTMLSpanElement> & {
		match: MatchedText;
		maxLength?: number;
	} = $props();

	const startIndex = $derived.by(() => {
		if (!match.word) return 0;

		const si = match.word.start - Math.floor(maxLength / 2);

		return Math.max(0, si);
	});
</script>

<span {...restProps}>
	{#if match.word}
		{#if startIndex > 0}
			<span class="text-muted-foreground">...</span>
		{/if}
		<span>{match.text.slice(startIndex, match.word.start)}</span><span
			class="text-foreground font-semibold"
			>{match.text.slice(match.word.start, match.word.end)}</span
		><span>{match.text.slice(match.word.end, startIndex + maxLength)}</span>
		{#if match.text.length > startIndex + maxLength}
			<span class="text-muted-foreground">...</span>
		{/if}
	{:else}
		{match.text.slice(0, maxLength)}
		{#if match.text.length > maxLength}
			<span class="text-muted-foreground">...</span>
		{/if}
	{/if}
</span>
