<script lang="ts">
	import { shortcut } from '$lib/actions/shortcut.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import * as NumberField from '$lib/components/ui/number-field';

	type Props = {
		open: boolean;
		totalChats: number;
		value: number;
		onClose?: () => void;
		onSubmit?: (value: number) => void;
	};

	let {
		open = $bindable(false),
		totalChats,
		value = $bindable(0),
		onClose,
		onSubmit
	}: Props = $props();
</script>

<svelte:window use:shortcut={{ key: 'g', ctrl: true, callback: () => (open = !open) }} />

<Dialog.Root
	bind:open
	onOpenChange={() => {
		if (open === false) {
			onClose?.();
		}
	}}
>
	<Dialog.Content
		withOverlay={false}
		showCloseButton={false}
		animated={false}
		class="w-fit top-1/4"
	>
		<form
			class="flex flex-col gap-1"
			onsubmit={(e) => {
				e.preventDefault();
				onSubmit?.(value);
			}}
		>
			<Label class="flex items-center gap-1">
				Chat index
				<span class="font-bold">1-{totalChats}</span>
			</Label>
			<NumberField.Root min={1} max={totalChats} value={null}>
				<NumberField.Group>
					<NumberField.Input
						class="w-[212px]"
						oninput={(e) => {
							value = Number((e.currentTarget as HTMLInputElement).value);
						}}
					/>
				</NumberField.Group>
			</NumberField.Root>
		</form>
	</Dialog.Content>
</Dialog.Root>
