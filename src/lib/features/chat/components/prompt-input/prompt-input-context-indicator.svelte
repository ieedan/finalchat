<script lang="ts">
	import { Gauge } from '$lib/components/ui/gauge';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { formatNumberShort } from '$lib/utils/number-format';

	type Props = {
		tokensUsed: number;
		contextLength: number;
	};

	let { tokensUsed, contextLength }: Props = $props();

	const usedPercent = $derived((tokensUsed / contextLength) * 100);
</script>

{#if usedPercent >= 25}
	<Tooltip.Provider>
		<Tooltip.Root delayDuration={250}>
			<Tooltip.Trigger>
				<Gauge value={usedPercent} max={100} class="size-5" />
			</Tooltip.Trigger>
			<Tooltip.Content>
				{usedPercent.toFixed(0)}% ・{formatNumberShort(tokensUsed)} / {formatNumberShort(
					contextLength
				)} context used
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}
