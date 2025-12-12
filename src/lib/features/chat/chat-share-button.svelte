<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Separator } from '$lib/components/ui/separator';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import { CheckIcon, LockIcon, GlobeIcon } from '@lucide/svelte';
	import { Snippet } from '$lib/components/ui/snippet';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';

	type Props = {
		animated?: boolean;
		chat: Doc<'chat'>;
	};

	let { animated = false, chat }: Props = $props();

	let value = $derived<'private' | 'public'>(chat.public ? 'public' : 'private');

	const client = useConvexClient();

	async function updatePublic() {
		await client.mutation(api.chat.updatePublic, {
			chatId: chat._id,
			public: value === 'public'
		});
	}
</script>

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
			<Snippet class="bg-popover" text="https://finalchat.app/share/{chat._id}" />
		{/if}
	</Popover.Content>
</Popover.Root>

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
		class="py-3 px-4 has-data-[state=checked]:bg-accent hover:cursor-pointer last:rounded-b-lg first:rounded-t-lg flex items-center gap-4 justify-between"
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
