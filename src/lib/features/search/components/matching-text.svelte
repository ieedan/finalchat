<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		text,
		search,
		maxLength = 50
	}: { text: string; search: string; maxLength?: number } = $props();

	const words = $derived(text.split(' '));

	const matchingWords = $derived(
		new Set(words.filter((word) => word.toLowerCase().includes(search.toLowerCase())))
	);

	const matchingIndices = $derived(
		words.map((word, i) => (matchingWords.has(word) ? i : -1)).filter((i) => i !== -1)
	);

	const shouldTruncate = $derived(text.length > maxLength);

	const displayedWords = $derived.by(() => {
		if (!shouldTruncate || matchingIndices.length === 0) {
			// If no truncation needed or no matches, show all words
			return { words, startEllipsis: false, endEllipsis: false };
		}

		// Find the first matching word index
		const firstMatchIndex = matchingIndices[0];
		const lastMatchIndex = matchingIndices[matchingIndices.length - 1];

		// Calculate how many characters we can show
		// Reserve space for ellipsis (3 chars each)
		const availableLength = maxLength - 6; // Reserve for "..." and "..."

		// Start from the first matching word and work backwards/forwards
		let startIndex = firstMatchIndex;
		let endIndex = lastMatchIndex;
		let currentLength = 0;

		// Calculate length of matching words section
		for (let i = startIndex; i <= endIndex; i++) {
			currentLength += words[i].length + (i < endIndex ? 1 : 0); // +1 for space
		}

		// Expand backwards and forwards to fill available space
		while (currentLength < availableLength) {
			const canExpandBack = startIndex > 0;
			const canExpandForward = endIndex < words.length - 1;

			if (!canExpandBack && !canExpandForward) break;

			// Prefer expanding backwards first, then forwards
			if (canExpandBack) {
				const newLength = currentLength + words[startIndex - 1].length + 1;
				if (newLength <= availableLength) {
					startIndex--;
					currentLength = newLength;
					continue;
				}
			}

			if (canExpandForward) {
				const newLength = currentLength + words[endIndex + 1].length + 1;
				if (newLength <= availableLength) {
					endIndex++;
					currentLength = newLength;
					continue;
				}
			}

			break;
		}

		return {
			words: words.slice(startIndex, endIndex + 1),
			startEllipsis: startIndex > 0,
			endEllipsis: endIndex < words.length - 1
		};
	});
</script>

{#each displayedWords.words as word, i}
	{@const isMatching = matchingWords.has(word)}
	{@const isFirst = i === 0}
	{@const isLast = i === displayedWords.words.length - 1}
	<span>
		{#if isFirst && displayedWords.startEllipsis}
			<span>...</span>
		{/if}
		<span class={cn(isMatching ? 'font-medium text-foreground' : '')}>{word}</span>
		{#if isLast && displayedWords.endEllipsis}
			<span>...</span>
		{/if}
	</span>
	{#if i < displayedWords.words.length - 1}
		{' '}
	{/if}
{/each}
