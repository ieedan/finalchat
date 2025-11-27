<script lang="ts">
	import { cn } from '$lib/utils';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import { setMode, userPrefersMode } from 'mode-watcher';

	type Props = {
		size?: 'sm' | 'default';
	};

	let { size = 'default' }: Props = $props();
</script>

<div
	class={cn('flex h-6 w-[72px] place-items-center rounded-2xl border border-border', {
		'h-6 w-[72px]': size == 'sm',
		'h-8 w-[96px]': size == 'default'
	})}
>
	{@render Button({
		mode: 'system'
	})}
	{@render Button({
		mode: 'light'
	})}
	{@render Button({
		mode: 'dark'
	})}
</div>

{#snippet Button({ mode }: { mode: 'system' | 'light' | 'dark' })}
	<button
		type="button"
		data-selected={userPrefersMode.current == mode}
		class={cn(
			'flex place-items-center justify-center rounded-full border border-transparent text-muted-foreground transition-all hover:text-foreground data-[selected=true]:border-border data-[selected=true]:text-foreground',
			{ 'size-6 [&>svg]:size-3': size == 'sm', 'size-8 [&>svg]:size-4': size == 'default' }
		)}
		onclick={() => setMode(mode)}
	>
		{#if mode == 'system'}
			<MonitorIcon />
		{:else if mode == 'light'}
			<SunIcon />
		{:else}
			<MoonIcon />
		{/if}
	</button>
{/snippet}
