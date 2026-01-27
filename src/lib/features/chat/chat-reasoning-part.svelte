<script lang="ts">
	import type { ReasoningOutput } from 'ai';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import BrainIcon from 'remixicon-svelte/icons/brain-line';
	import { Spinner } from '$lib/components/ui/spinner';
	import ChevronUpIcon from 'remixicon-svelte/icons/arrow-up-s-line';
	import ChevronDownIcon from 'remixicon-svelte/icons/arrow-down-s-line';
	import Streamdown from './components/streamdown.svelte';

	type Props = {
		part: ReasoningOutput;
		isLastPart: boolean;
	};

	let { part, isLastPart }: Props = $props();

	let showReasoning = $state(true);
</script>

<div class="pb-2">
	<Collapsible.Root bind:open={showReasoning} class="flex flex-col gap-2">
		<Collapsible.Trigger class="flex items-center gap-2">
			<BrainIcon class="size-4" />
			Reasoning
			{#if isLastPart}
				<Spinner />
			{/if}
			{#if showReasoning}
				<ChevronUpIcon class="size-4" />
			{:else}
				<ChevronDownIcon class="size-4" />
			{/if}
		</Collapsible.Trigger>
		<Collapsible.Content class="bg-card rounded-lg p-4">
			<Streamdown content={part.text} animationEnabled={false} />
		</Collapsible.Content>
	</Collapsible.Root>
</div>
