<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { useThemeProvider } from '$lib/components/theme-provider/theme-provider-state.svelte';
	import { FONTS_SANS, FONTS_MONO } from '$lib/components/theme-provider/fonts';
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { Label } from '$lib/components/ui/label';

	const themeProvider = useThemeProvider();

	let selectedSansFont = $derived(themeProvider.sansFont.name);
	let selectedMonoFont = $derived(themeProvider.monoFont.name);

	function handleSansFontChange(fontName: string) {
		const font = FONTS_SANS.find((f) => f.name === fontName);
		if (font) themeProvider.selectSansFont(font);
	}

	function handleMonoFontChange(fontName: string) {
		const font = FONTS_MONO.find((f) => f.name === fontName);
		if (font) themeProvider.selectMonoFont(font);
	}
</script>

<Card.Root class="gap-4">
	<Card.Header>
		<Card.Title>Font</Card.Title>
		<Card.Description>Customize the fonts used throughout the interface.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-6">
		<div class="flex flex-col gap-3">
			<Label>Chat Font</Label>
			<RadioGroupPrimitive.Root
				value={selectedSansFont}
				onValueChange={handleSansFontChange}
				class="flex flex-wrap gap-3"
			>
				{#each FONTS_SANS as font (font.name)}
					<RadioGroupPrimitive.Item value={font.name} class="group cursor-pointer">
						{#snippet children({ checked })}
							<div class="flex flex-col items-center gap-2">
								<div
									class={cn(
										'flex size-24 items-center justify-center rounded-lg border-2 transition-colors',
										checked
											? 'border-primary bg-background'
											: 'border-border bg-background hover:border-muted-foreground/50'
									)}
								>
									<span class="text-3xl text-foreground" style:font-family={font.family}>Aa</span>
								</div>
								<span
									class="text-muted-foreground text-xs"
									style:font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
									>{font.name}</span
								>
							</div>
						{/snippet}
					</RadioGroupPrimitive.Item>
				{/each}
			</RadioGroupPrimitive.Root>
		</div>

		<div class="flex flex-col gap-3">
			<Label>Code Font</Label>
			<RadioGroupPrimitive.Root
				value={selectedMonoFont}
				onValueChange={handleMonoFontChange}
				class="flex flex-wrap gap-3"
			>
				{#each FONTS_MONO as font (font.name)}
					<RadioGroupPrimitive.Item value={font.name} class="group cursor-pointer">
						{#snippet children({ checked })}
							<div class="flex flex-col items-center gap-2">
								<div
									class={cn(
										'flex size-24 items-center justify-center rounded-lg border-2 transition-colors',
										checked
											? 'border-primary bg-background'
											: 'border-border bg-background hover:border-muted-foreground/50'
									)}
								>
									<span class="text-3xl text-foreground" style:font-family={font.family}>Aa</span>
								</div>
								<span
									class="text-muted-foreground text-xs"
									style:font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
									>{font.name}</span
								>
							</div>
						{/snippet}
					</RadioGroupPrimitive.Item>
				{/each}
			</RadioGroupPrimitive.Root>
		</div>
	</Card.Content>
</Card.Root>

