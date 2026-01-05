<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Separator } from '$lib/components/ui/separator';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { CheckIcon, LockIcon, GlobeIcon, ShareIcon } from '@lucide/svelte';
	import { Snippet } from '$lib/components/ui/snippet';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import * as Drawer from '$lib/components/ui/drawer';

	type Props = {
		animated?: boolean;
		chat: Doc<'chats'>;
	};

	let { animated = false, chat }: Props = $props();

	let value = $derived<'private' | 'public'>(chat.public ? 'public' : 'private');

	const client = useConvexClient();

	async function updatePublic() {
		await client.mutation(api.chats.updatePublic, {
			chatId: chat._id,
			public: value === 'public'
		});
	}

	const isMobile = new IsMobile();
</script>

{#if isMobile.current}
	<Drawer.Root>
		<Drawer.Trigger class={cn(buttonVariants({ variant: 'outline' }))}>Share</Drawer.Trigger>
		<Drawer.Content>
			<RadioGroup.Root
				bind:value
				class="border border-border rounded-lg gap-0 bg-input"
				onValueChange={updatePublic}
			>
				{@render option({
					icon: LockIcon,
					label: 'Private',
					description: 'Only you have access',
					value: 'private'
				})}
				<Separator />
				{@render option({
					icon: GlobeIcon,
					label: 'Public Access',
					description: 'Anyone with the link can view',
					value: 'public'
				})}
			</RadioGroup.Root>

			{#if navigator.canShare( { title: chat.title, url: `https://finalchat.app/share/${chat._id}` } )}
				{#if value === 'public'}
					<div class="h-10 flex items-center justify-end">
						<Button
							onclick={() => {
								navigator.share({
									title: chat.title,
									url: `https://finalchat.app/share/${chat._id}`
								});
							}}
							class="size-10"
							variant="outline"
							size="icon"
						>
							<ShareIcon />
						</Button>
					</div>
				{:else}
					<div class="h-10 flex items-center justify-center">
						<span class="text-muted-foreground text-sm text-center">
							Make your chat public to share it with others.
						</span>
					</div>
				{/if}
			{:else if value === 'public'}
				<a
					href="/share/{chat._id}"
					target="_blank"
					class="w-full aspect-video rounded-lg overflow-hidden border border-border"
				>
					<img src="/chat/{chat._id}/og.png" alt="OG" class="w-full aspect-video object-fit" />
				</a>
				<Snippet class="bg-popover" text="https://finalchat.app/share/{chat._id}" />
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Popover.Root>
		<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }))}>Share</Popover.Trigger>
		<Popover.Content align="end" {animated} class="w-sm flex flex-col gap-2">
			<RadioGroup.Root
				bind:value
				class="border border-border rounded-lg gap-0 bg-input"
				onValueChange={updatePublic}
			>
				{@render option({
					icon: LockIcon,
					label: 'Private',
					description: 'Only you have access',
					value: 'private'
				})}
				<Separator />
				{@render option({
					icon: GlobeIcon,
					label: 'Public Access',
					description: 'Anyone with the link can view',
					value: 'public'
				})}
			</RadioGroup.Root>

			{#if value === 'public'}
				<a
					href="/share/{chat._id}"
					target="_blank"
					class="w-full aspect-video rounded-lg overflow-hidden border border-border"
				>
					<img src="/chat/{chat._id}/og.png" alt="OG" class="w-full aspect-video object-fit" />
				</a>
				<Snippet class="bg-popover" text="https://finalchat.app/share/{chat._id}" />
			{/if}
		</Popover.Content>
	</Popover.Root>
{/if}

{#snippet option({
	icon: Icon,
	label,
	description,
	value: v
}: {
	icon: typeof LockIcon;
	label: string;
	description: string;
	value: 'private' | 'public';
})}
	<label
		for={v}
		class="py-3 px-4 bg-popover has-data-[state=checked]:bg-accent hover:cursor-pointer last:rounded-b-lg first:rounded-t-lg flex items-center gap-4 justify-between"
	>
		<div class="flex items-center gap-4">
			<Icon class="size-4" />
			<div class="flex flex-col gap-0.5 text-sm">
				<span>{label}</span>
				<span class="text-muted-foreground text-nowrap">{description}</span>
			</div>
		</div>
		<div>
			{#if value === v}
				<CheckIcon class="size-4 text-primary" />
			{/if}
		</div>
		<RadioGroup.Item id={v} value={v} class="hidden" />
	</label>
{/snippet}
