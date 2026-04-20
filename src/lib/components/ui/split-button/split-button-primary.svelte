<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...rest }: ButtonProps = $props();
</script>

<Button data-slot="split-button-primary" class={cn('rounded-r-none', className)} {...rest}>
	{@render children?.()}
</Button>
