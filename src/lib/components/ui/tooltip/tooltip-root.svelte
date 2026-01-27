<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	let {
		open = $bindable(false),
		delayDuration = 250,
		...restProps
	}: TooltipPrimitive.RootProps = $props();
</script>

<TooltipPrimitive.Root {open} {delayDuration} {...restProps} />
