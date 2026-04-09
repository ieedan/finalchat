<script lang="ts">
	import ShinyText from '$lib/components/animations/shiny-text.svelte';
	import Search2Line from 'remixicon-svelte/icons/search-2-line';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Popover from '$lib/components/ui/popover';
	import { onDestroy } from 'svelte';
	import type { WebSearchHit, WebSearchTool } from './types.js';

	type Props = {
		tool: WebSearchTool;
	};

	let { tool }: Props = $props();

	const results = $derived<WebSearchHit[]>(tool.result?.output ?? []);

	let previewOpen = $state(false);
	let anchorEl = $state<HTMLElement | null>(null);
	let activeResult = $state<WebSearchHit | null>(null);
	let closeTimer = 0;

	function clearCloseTimer() {
		if (closeTimer) {
			clearTimeout(closeTimer);
			closeTimer = 0;
		}
	}

	function scheduleClose() {
		clearCloseTimer();
		closeTimer = window.setTimeout(() => {
			previewOpen = false;
			activeResult = null;
			anchorEl = null;
			closeTimer = 0;
		}, 200);
	}

	function openPreview(el: HTMLElement, result: WebSearchHit) {
		clearCloseTimer();
		anchorEl = el;
		activeResult = result;
		previewOpen = true;
	}

	onDestroy(() => clearCloseTimer());
</script>

{#if tool.result}
	<div class="text-muted-foreground text-nowrap flex items-center gap-1.5">
		<Search2Line class="size-4 inline shrink-0" />
		<div class="flex items-center gap-1.5">
			<span class="font-medium">Found</span>
			{results.length}
			results
			<Popover.Root bind:open={previewOpen}>
				<Avatar.Group class="-space-x-1.5">
					{#each results.filter((r) => r.favicon) as result, i (i)}
						<button
							type="button"
							class="inline-flex rounded-full border-0 bg-background p-0 shadow-none focus-visible:ring-2 focus-visible:ring-ring"
							aria-expanded={previewOpen && activeResult === result}
							aria-haspopup="dialog"
							onpointerenter={(e) => openPreview(e.currentTarget, result)}
							onpointerleave={scheduleClose}
						>
							<Avatar.Root class="size-4">
								<Avatar.Image src={result.favicon} />
							</Avatar.Root>
						</button>
					{/each}
				</Avatar.Group>
				<Popover.Content
					customAnchor={anchorEl ?? undefined}
					class="w-64"
					trapFocus={false}
					onOpenAutoFocus={(e) => e.preventDefault()}
					onpointerenter={clearCloseTimer}
					onpointerleave={scheduleClose}
				>
					{#if activeResult}
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<Avatar.Root class="size-4">
									<Avatar.Image src={activeResult.favicon} />
								</Avatar.Root>
								<span class="text-xs text-muted-foreground truncate">
									{activeResult.url}
								</span>
							</div>
							<a
								href={activeResult.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm font-medium hover:underline"
							>
								{activeResult.title}
							</a>
							<img
								src={activeResult.image}
								alt={activeResult.title}
								class="w-full h-48 object-cover rounded-md"
							/>
						</div>
					{/if}
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>
{:else}
	<ShinyText class="flex items-center gap-1.5">
		<Search2Line class="size-4 inline shrink-0" />
		<span class="font-medium"> Searching the web... </span>
	</ShinyText>
{/if}
