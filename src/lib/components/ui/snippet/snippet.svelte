<script lang="ts">
	import { cn } from '$lib/utils';
	import { tv, type VariantProps } from 'tailwind-variants';
	import { CopyButton } from '$lib/components/ui/copy-button';

	const style = tv({
		base: 'relative w-full max-w-full rounded-md border bg-input',
		variants: {
			variant: {
				default: 'border-border',
				secondary: 'border-border bg-accent',
				destructive: 'border-destructive bg-destructive',
				primary: 'border-primary bg-primary text-primary-foreground'
			}
		}
	});

	type Variant = VariantProps<typeof style>['variant'];

	type Props = {
		variant?: Variant;
		text: string;
		class?: string;
		onCopy?: () => void;
	};

	let { text, variant = 'default', onCopy, class: className }: Props = $props();
</script>

<div class={cn(style({ variant, className: className }))}>
	{#if typeof text == 'string'}
		<input
			type="text"
			value={text}
			readonly
			tabindex={-1}
			class={cn(
				'w-[calc(100%-24px)] min-w-0 px-3 py-2.5 text-left font-mono outline-none text-sm whitespace-nowrap'
			)}
		/>
	{/if}

	<CopyButton
		class="hover:text-opacity-80 absolute top-1/2 right-2 size-7 -translate-y-1/2 transition-opacity ease-in-out hover:bg-transparent"
		{text}
		{onCopy}
	/>
</div>
