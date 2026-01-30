<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { cn } from '$lib/utils';
	import { userPrefersMode } from 'mode-watcher';
	import { useSettingsSetting, type Setting } from '../settings.svelte';

	const meta: Setting = {
		id: 'theme',
		title: 'Theme',
		description: 'Customize the theme of the interface.'
	};

	const settingState = useSettingsSetting(meta);

	const lightPreviewClasses =
		'[--background:oklch(0.9518_0.005391873657638326_95.09859092511448)] [--foreground:oklch(0.3761_0.00612555066067004_56.0433322108949)] [--card:oklch(98.18%_0.005391873657638326_95.09859092511448)] [--card-foreground:var(--foreground)] [--popover:oklch(0.9518_0.005391873657638326_95.09859092511448)] [--popover-foreground:var(--card-foreground)] [--secondary:oklch(98.18%_0.005391873657638326_95.09859092511448)] [--secondary-foreground:oklch(21.61%_0.00612555066067004_56.0433322108949)] [--muted:oklch(98.18%_0.005391873657638326_95.09859092511448)] [--muted-foreground:oklch(0.295_0.015_286.067)] [--accent:oklch(0.9118_0.005391873657638326_95.09859092511448)] [--accent-foreground:var(--foreground)] [--destructive:oklch(0.704_0.191_22.216)] [--destructive-foreground:oklch(98.18%_0.005391873657638326_95.09859092511448)] [--border:oklch(0.898_0.006286933207768164_34.29748037425685)] [--input:oklch(0.932_0.006286933207768164_34.29748037425685)] [--ring:oklch(0.552_0.016_285.938)] [--sidebar:oklch(98.18%_0.005391873657638326_95.09859092511448)] [--sidebar-foreground:var(--foreground)] [--sidebar-primary:var(--primary)] [--sidebar-primary-foreground:var(--primary-foreground)] [--sidebar-accent:oklch(0.900_0.006286933207768164_34.29748037425685)] [--sidebar-accent-foreground:var(--foreground)] [--sidebar-border:var(--border)] [--sidebar-ring:var(--ring)]';
	const darkPreviewClasses =
		'[--background:oklch(21.61%_0.00612555066067004_56.0433322108949)] [--foreground:oklch(98.18%_0.005391873657638326_95.09859092511448)] [--card:oklch(26.85%_0.006286933207768164_34.29748037425685)] [--card-foreground:var(--foreground)] [--popover:var(--card)] [--popover-foreground:var(--card-foreground)] [--secondary:oklch(0.274_0.006_286.033)] [--secondary-foreground:oklch(0.985_0_0)] [--muted:oklch(0.274_0.006_286.033)] [--muted-foreground:oklch(0.705_0.015_286.067)] [--accent:oklch(0.3448_0.006286933207768164_34.29748037425685)] [--accent-foreground:var(--foreground)] [--destructive:oklch(0.704_0.191_22.216)] [--destructive-foreground:oklch(21.61%_0.00612555066067004_56.0433322108949)] [--border:oklch(0.2984_0.006286933207768164_34.29748037425685)] [--input:oklch(26.85%_0.006286933207768164_34.29748037425685)] [--ring:oklch(0.552_0.016_285.938)] [--sidebar:oklch(0.141_0.005_285.823)] [--sidebar-foreground:var(--foreground)] [--sidebar-primary:var(--primary)] [--sidebar-primary-foreground:var(--primary-foreground)] [--sidebar-accent:oklch(0.3006_0.006286933207768164_34.29748037425685)] [--sidebar-accent-foreground:var(--foreground)] [--sidebar-border:var(--border)] [--sidebar-ring:var(--ring)]';

	type Theme = 'light' | 'dark';

	function themeClasses(theme: Theme) {
		return theme === 'light' ? lightPreviewClasses : darkPreviewClasses;
	}

	const sidebarStrip =
		'flex w-[28%] min-w-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-1';
	const mainAreaBase = 'flex flex-1 flex-col min-w-0 overflow-hidden bg-background';
	const conversationAreaBase = 'flex flex-col gap-1.5 p-1.5 flex-1 min-h-0 overflow-hidden';
</script>

{#snippet sidebar()}
	<div class={cn(sidebarStrip)}>
		<div class="h-4 w-full shrink-0 rounded-sm bg-primary"></div>
		<div class="mt-1 flex flex-col gap-0.5 items-start">
			<div class="h-1 w-full max-w-full rounded-sm bg-sidebar-accent/80"></div>
			<div class="h-1 w-4/5 rounded-sm bg-sidebar-accent/60"></div>
			<div class="h-1 w-3/4 rounded-sm bg-sidebar-accent/60"></div>
		</div>
		<div class="mt-auto flex justify-start pt-1">
			<div class="size-3 rounded-full border border-sidebar-border bg-sidebar-accent"></div>
		</div>
	</div>
{/snippet}

{#snippet conversationBubbles({ compact = false }: { compact?: boolean })}
	{@const bubbleMaxW = 'max-w-[50%]'}
	{@const bubblePadding = compact ? 'px-1.5 py-0.5' : 'px-2 py-1'}
	{@const lineH = compact ? 'h-1' : 'h-1.5'}
	{@const lineW1 = compact ? 'w-8' : 'w-12'}
	{@const lineW2 = compact ? 'w-10' : 'w-16'}
	{@const lineW3 = compact ? 'w-6' : 'w-10'}
	<div class={cn(conversationAreaBase, compact && 'rounded-none')}>
		<div class="flex justify-end">
			<div class={cn(bubbleMaxW, 'rounded-sm bg-muted/80', bubblePadding)}>
				<div class={cn(lineH, lineW1, 'rounded-full bg-muted-foreground/30')}></div>
			</div>
		</div>
		<div class="flex justify-start">
			<div class={cn(bubbleMaxW, 'rounded-sm bg-muted/60', bubblePadding)}>
				<div class={cn(lineH, lineW2, 'rounded-full bg-muted-foreground/25')}></div>
			</div>
		</div>
		<div class="flex justify-end">
			<div class={cn(bubbleMaxW, 'rounded-sm bg-muted/80', bubblePadding)}>
				<div class={cn(lineH, lineW3, 'rounded-full bg-muted-foreground/30')}></div>
			</div>
		</div>
	</div>
{/snippet}

{#snippet inputBar()}
	<div class="px-1.5 pb-1.5">
		<div
			class="flex items-center gap-1.5 rounded-md border border-border bg-background/80 p-1.5 shrink-0"
		>
			<div class="h-4 flex-1 rounded bg-background/80 min-w-0"></div>
			<div class="size-3.5 shrink-0 rounded-sm bg-primary"></div>
		</div>
	</div>
{/snippet}

{#snippet themePreview({ class: className, theme }: { theme: Theme; class?: string })}
	<div class={cn(themeClasses(theme), 'flex h-full w-full', className)}>
		{@render sidebar()}
		<div class={cn(mainAreaBase)}>
			<div class={cn('flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden')}>
				{@render conversationBubbles({})}
			</div>
			{@render inputBar()}
		</div>
	</div>
{/snippet}

<Card.Root class="w-full" style={settingState.style}>
	<Card.Header>
		<Card.Title>Theme</Card.Title>
	</Card.Header>
	<Card.Content>
		<RadioGroup.Root
			bind:value={userPrefersMode.current}
			class="grid grid-cols-2 sm:grid-cols-3 gap-4"
		>
			<label
				for="theme-light"
				class="flex cursor-pointer flex-col items-center gap-2 transition-all"
			>
				<div
					class={cn(
						'aspect-16/12 w-full rounded-lg overflow-hidden border border-border flex transition-shadow',
						userPrefersMode.current === 'light' &&
							'ring-2 ring-primary ring-offset-2 ring-offset-background'
					)}
				>
					{@render themePreview({ theme: 'light' })}
				</div>
				<span class="text-sm text-muted-foreground">Light</span>
				<RadioGroup.Item id="theme-light" value="light" class="sr-only" />
			</label>

			<label
				for="theme-system"
				class="hidden cursor-pointer flex-col items-center gap-2 transition-all sm:flex"
			>
				<div
					class={cn(
						'aspect-16/12 w-full rounded-lg overflow-hidden relative border border-border transition-shadow',
						userPrefersMode.current === 'system' &&
							'ring-2 ring-primary ring-offset-2 ring-offset-background'
					)}
				>
					<!-- Dark: full size but clipped to right half only -->
					<div
						class="absolute inset-0 size-full overflow-hidden [clip-path:inset(0_0_0_50%)] isolate"
					>
						{@render themePreview({ theme: 'dark' })}
					</div>
					<!-- Light: full size but clipped to left half only -->
					<div
						class="absolute inset-0 size-full overflow-hidden [clip-path:inset(0_50%_0_0)] isolate"
					>
						{@render themePreview({ theme: 'light' })}
					</div>
				</div>
				<span class="text-sm text-muted-foreground">System</span>
				<RadioGroup.Item id="theme-system" value="system" class="sr-only" />
			</label>

			<label
				for="theme-dark"
				class="flex cursor-pointer flex-col items-center gap-2 transition-all"
			>
				<div
					class={cn(
						'aspect-16/12 w-full rounded-lg overflow-hidden border border-border flex transition-shadow',
						userPrefersMode.current === 'dark' &&
							'ring-2 ring-primary ring-offset-2 ring-offset-background'
					)}
				>
					{@render themePreview({ theme: 'dark' })}
				</div>
				<span class="text-sm text-muted-foreground">Dark</span>
				<RadioGroup.Item id="theme-dark" value="dark" class="sr-only" />
			</label>
		</RadioGroup.Root>
	</Card.Content>
</Card.Root>
