<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { useThemeProvider } from '$lib/components/theme-provider/theme-provider-state.svelte';
	import { FONT_PRESETS } from '$lib/components/theme-provider/fonts';
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import Streamdown from '$lib/features/chat/components/streamdown.svelte';

	const themeProvider = useThemeProvider();

	let selectedPreset = $derived(themeProvider.fontPreset.name);

	function handlePresetChange(presetName: string) {
		const preset = FONT_PRESETS.find((p) => p.name === presetName);
		if (preset) themeProvider.selectFontPreset(preset);
	}

	const previewContent = `Here's an example of how text will look with this font.

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\``;
</script>

<Card.Root class="gap-4">
	<Card.Header>
		<Card.Title>Font</Card.Title>
		<Card.Description>Choose a font preset for the interface and code.</Card.Description>
	</Card.Header>
	<Card.Content class="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
		<!-- Font Presets -->
		<RadioGroupPrimitive.Root
			value={selectedPreset}
			onValueChange={handlePresetChange}
			class="grid grid-cols-2 grid-rows-2 gap-3"
		>
			{#each FONT_PRESETS as preset (preset.name)}
				<RadioGroupPrimitive.Item value={preset.name} class="group h-full cursor-pointer">
					{#snippet children({ checked })}
						<div
							class={cn(
								'flex h-full flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors',
								checked
									? 'border-primary bg-background'
									: 'border-border bg-background hover:border-muted-foreground/50'
							)}
						>
							<span class="text-3xl text-foreground" style:font-family={preset.sansFamily}>Aa</span>
							<span
								class="text-muted-foreground text-xs"
								style="font-family: 'system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto', sans-serif"
							>
								{preset.name}
							</span>
						</div>
					{/snippet}
				</RadioGroupPrimitive.Item>
			{/each}
		</RadioGroupPrimitive.Root>

		<!-- Preview -->
		<div class="bg-muted/50 flex flex-col gap-2 rounded-lg border p-4">
			<span
				class="text-muted-foreground text-xs uppercase tracking-wider"
				style="font-family: 'system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto', sans-serif"
			>
				Preview
			</span>
			<Streamdown content={previewContent} animationEnabled={false} />
		</div>
	</Card.Content>
</Card.Root>
