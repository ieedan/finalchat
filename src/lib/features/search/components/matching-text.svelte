<script lang="ts">
	import { cn } from '$lib/utils';

	let { text, search }: { text: string; search: string } = $props();

	const words = $derived(text.split(' '));

	const matchingWords = $derived(
		new Set(words.filter((word) => word.toLowerCase().includes(search.toLowerCase())))
	);
</script>

{#each words as word, i}
	{@const isMatching = matchingWords.has(word)}
	<span class={cn(isMatching ? 'font-medium' : '')}>{word}</span>
	{#if i < words.length - 1}
		{' '}
	{/if}
{/each}
