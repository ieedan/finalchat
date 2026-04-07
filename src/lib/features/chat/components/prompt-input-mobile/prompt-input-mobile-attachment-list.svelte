<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInputAttachmentList } from '../prompt-input/prompt-input.svelte.js';
	import { RiCloseLine as XIcon } from 'remixicon-svelte';
	import { animated } from 'animated-svelte';
	import {
		attachmentTypeLabel,
		guessMediaTypeFromFileName,
		isImageAttachmentMediaType
	} from '$lib/utils/chat-attachment-types';
	import { RiFileLine as FileIcon } from 'remixicon-svelte';

	let { class: className, ...rest }: HTMLAttributes<HTMLDivElement> = $props();

	const attachmentListState = usePromptInputAttachmentList();

	const hasAttachments = $derived(
		attachmentListState.rootState.opts.attachments.current.length > 0 ||
			attachmentListState.rootState.uploadingAttachments.size > 0
	);

	// yeah this is weird
	// for some reason using PersistedState to store the attachments will cause issues with the first each block
	// this indirection seems to fix it for whatever odd reason
	const uploadedAttachments = $derived.by(() => {
		return attachmentListState.rootState.opts.attachments.current.map((obj) => ({
			...obj
		}));
	});
</script>

<div
	class={cn(
		'flex items-center w-full gap-2 h-0 transition-all bg-accent/50 px-3 border-transparent',
		'data-[has-attachments=true]:py-2 data-[has-attachments=true]:h-18 data-[has-attachments=true]:border-b data-[has-attachments=true]:border-border',
		className
	)}
	data-has-attachments={hasAttachments}
	{...rest}
>
	{#each uploadedAttachments as { url, key, mediaType } (key)}
		<div class="size-12 rounded-sm border relative overflow-hidden" data-state="uploaded">
			<button
				type="button"
				class="absolute cursor-pointer bg-background flex items-center justify-center -top-1.5 -right-1.5 rounded-full border border-border size-5 z-10"
				onclick={() => attachmentListState.rootState.deleteAttachment(key)}
			>
				<XIcon class="size-3.5" />
			</button>
			<a href={url} target="_blank" rel="noopener noreferrer" class="size-full flex">
				{#if isImageAttachmentMediaType(mediaType)}
					<img src={url} alt="" class="size-full object-cover rounded-sm" />
				{:else}
					<div
						class="text-muted-foreground bg-muted flex size-full flex-col items-center justify-center gap-0.5 rounded-sm px-0.5 text-[9px] font-medium leading-none text-center"
					>
						<FileIcon class="size-4 shrink-0 opacity-80" />
						<span class="line-clamp-2">{attachmentTypeLabel(mediaType)}</span>
					</div>
				{/if}
			</a>
		</div>
	{/each}
	{#each attachmentListState.rootState.uploadingAttachments as [name, file] (name)}
		{@const url = URL.createObjectURL(file)}
		{@const effectiveMime = file.type || guessMediaTypeFromFileName(file.name) || ''}
		<animated.div
			class="size-12 rounded-sm border relative animate-pulse overflow-hidden"
			initial={{ scale: 0.75, opacity: 0, y: 10 }}
			animate={{ scale: 1, opacity: 1, y: 0 }}
			transition={{ duration: 0.15, delay: 0, timingFunction: 'ease-out' }}
			data-state="uploading"
		>
			<a href={url} target="_blank" rel="noopener noreferrer" class="size-full flex">
				{#if isImageAttachmentMediaType(effectiveMime)}
					<img src={url} alt="" class="size-full object-cover rounded-sm" />
				{:else}
					<div
						class="text-muted-foreground bg-muted flex size-full flex-col items-center justify-center gap-0.5 rounded-sm px-0.5 text-[9px] font-medium leading-none text-center"
					>
						<FileIcon class="size-4 shrink-0 opacity-80" />
						<span class="line-clamp-2">{attachmentTypeLabel(effectiveMime || 'File')}</span>
					</div>
				{/if}
			</a>
		</animated.div>
	{/each}
</div>
