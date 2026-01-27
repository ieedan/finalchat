<script lang="ts">
	import { Gauge } from '$lib/components/ui/gauge';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { formatNumberShort } from '$lib/utils/number-format';
	import { cn } from '$lib/utils';

	type Props = {
		tokensUsed: number;
		contextLength: number;
		class?: string;
	};

	let { tokensUsed, contextLength, class: className }: Props = $props();

	const usedPercent = $derived((tokensUsed / contextLength) * 100);
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Gauge value={usedPercent} max={100} class={cn('size-5', className)} />
		</Tooltip.Trigger>
		<Tooltip.Content>
			{usedPercent.toFixed(0)}% ・{formatNumberShort(tokensUsed)} / {formatNumberShort(
				contextLength
			)} context used
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
