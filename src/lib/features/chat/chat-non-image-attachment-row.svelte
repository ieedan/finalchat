<script lang="ts">
	import { cn } from '$lib/utils';
	import { attachmentTypeLabel } from '$lib/utils/chat-attachment-types';
	import { RiFileLine as FileIcon } from 'remixicon-svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		fileName,
		mediaType,
		compact = false,
		class: className,
		...rest
	}: HTMLAttributes<HTMLDivElement> & {
		fileName: string;
		mediaType: string;
		compact?: boolean;
	} = $props();

	const typeLabel = $derived(attachmentTypeLabel(mediaType));
</script>

<div
	class={cn(
		'text-foreground flex w-full min-w-0 items-center rounded-xl border border-border bg-card shadow-sm',
		compact ? 'gap-2 px-2.5 py-1.5' : 'gap-3 px-3 py-2.5',
		className
	)}
	{...rest}
>
	<div
		class={cn(
			'bg-muted text-foreground flex shrink-0 items-center justify-center rounded-lg border border-border/80',
			compact ? 'size-8' : 'size-10'
		)}
	>
		<FileIcon class={compact ? 'size-4' : 'size-5'} />
	</div>
	<div class="min-w-0 flex-1 text-left">
		<p class={cn('truncate font-semibold leading-tight', compact ? 'text-xs' : 'text-sm')}>
			{fileName}
		</p>
		<p class="text-muted-foreground text-xs leading-tight">{typeLabel}</p>
	</div>
</div>
