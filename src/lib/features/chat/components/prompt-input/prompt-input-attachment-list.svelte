<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePromptInputAttachmentList } from './prompt-input.svelte.js';
	import { RiCloseLine as XIcon } from 'remixicon-svelte';
	import { animated } from 'animated-svelte';
	import {
		fallbackAttachmentDisplayName,
		guessMediaTypeFromFileName,
		isImageAttachmentMediaType
	} from '$lib/utils/chat-attachment-types';
	import ChatNonImageAttachmentRow from '$lib/features/chat/chat-non-image-attachment-row.svelte';

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
		'flex flex-wrap items-center gap-2 min-h-0 transition-all bg-accent/50 rounded-t-lg px-3 border-transparent',
		'data-[has-attachments=true]:py-2 data-[has-attachments=true]:min-h-[4.75rem] data-[has-attachments=true]:border-b data-[has-attachments=true]:border-border',
		className
	)}
	data-has-attachments={hasAttachments}
	{...rest}
>
	{#each uploadedAttachments as { url, key, mediaType, fileName } (key)}
		<div
			class={cn(
				'relative shrink-0',
				isImageAttachmentMediaType(mediaType) ? 'size-12' : 'max-w-[min(18rem,calc(100vw-2rem))] min-w-[10rem]'
			)}
			data-state="uploaded"
		>
			<button
				type="button"
				class="absolute z-20 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border bg-background -top-1.5 -right-1.5"
				onclick={() => attachmentListState.rootState.deleteAttachment(key)}
			>
				<XIcon class="size-3.5" />
			</button>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				class={cn(
					isImageAttachmentMediaType(mediaType)
						? 'flex size-12 overflow-hidden rounded-md border border-border'
						: 'block w-full overflow-hidden rounded-xl border border-border'
				)}
			>
				{#if isImageAttachmentMediaType(mediaType)}
					<img src={url} alt="" class="size-full object-cover" />
				{:else}
					<ChatNonImageAttachmentRow
						compact
						fileName={fileName ?? fallbackAttachmentDisplayName(mediaType)}
						{mediaType}
						class="border-0 bg-background/80 shadow-none"
					/>
				{/if}
			</a>
		</div>
	{/each}
	{#each attachmentListState.rootState.uploadingAttachments as [name, file] (name)}
		{@const url = URL.createObjectURL(file)}
		{@const mime = file.type || guessMediaTypeFromFileName(file.name) || ''}
		<animated.div
			class={cn(
				'relative shrink-0 animate-pulse',
				isImageAttachmentMediaType(mime) ? 'size-12' : 'max-w-[min(18rem,calc(100vw-2rem))] min-w-[10rem]'
			)}
			initial={{ scale: 0.75, opacity: 0, y: 10 }}
			animate={{ scale: 1, opacity: 1, y: 0 }}
			transition={{ duration: 0.15, delay: 0, timingFunction: 'ease-out' }}
			data-state="uploading"
		>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				class={cn(
					isImageAttachmentMediaType(mime)
						? 'flex size-12 overflow-hidden rounded-md border border-border'
						: 'block w-full overflow-hidden rounded-xl border border-border'
				)}
			>
				{#if isImageAttachmentMediaType(mime)}
					<img src={url} alt="" class="size-full object-cover" />
				{:else}
					<ChatNonImageAttachmentRow
						compact
						fileName={file.name}
						mediaType={mime || 'application/octet-stream'}
						class="border-0 bg-background/80 shadow-none"
					/>
				{/if}
			</a>
		</animated.div>
	{/each}
</div>
