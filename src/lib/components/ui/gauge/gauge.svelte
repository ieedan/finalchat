<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		value: number;
		max: number;
		class?: string;
	};

	let { value, class: className, max }: Props = $props();

    const RADIUS = 50;
    const STROKE_WIDTH = 12;

    const VIEW_BOX_DIAMETER = RADIUS * 2 + STROKE_WIDTH;

    const circumference = $derived(2 * Math.PI * RADIUS);
</script>

<svg
	role="meter"
	aria-valuemin="0"
	aria-valuemax={max}
	aria-valuenow={value}
	aria-valuetext="{value} out of {max}"
	viewBox="0 0 {VIEW_BOX_DIAMETER} {VIEW_BOX_DIAMETER}"
	class={cn('text-foreground', className)}
>
    <!-- background -->
	<circle
		cx="55"
		cy="55"
		r={RADIUS}
		fill="none"
		class="stroke-accent"
		stroke-width={STROKE_WIDTH}
        stroke-linecap="round"
	/>

    <!-- progress -->
    <circle
		cx="55"
		cy="55"
		r={RADIUS}
		fill="none"
		class="stroke-current"
		stroke-width={STROKE_WIDTH}
        stroke-dasharray="{circumference}"
        stroke-dashoffset="{circumference * (1 - value / max)}"
        stroke-linecap="round"
        style="transform-origin: center; transform: rotate(-90deg); transition-property: stroke-dashoffset;"
	/>
</svg>
