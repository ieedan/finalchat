<script lang="ts">
	import { cn } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import { Separator as SeparatorPrimitive } from 'bits-ui';

	let { class: className, ...rest }: SeparatorPrimitive.RootProps = $props();
</script>

<Separator class={cn(className)} {...rest} />
