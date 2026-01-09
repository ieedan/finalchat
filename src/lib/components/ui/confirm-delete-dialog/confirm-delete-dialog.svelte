<script lang="ts" module>
	class ConfirmDeleteDialogState {
		open = $state(false);
		inputText = $state('');
		options = $state<ConfirmDeleteOptions | null>(null);
		loading = $state(false);

		constructor() {
			this.confirm = this.confirm.bind(this);
			this.cancel = this.cancel.bind(this);
		}

		newConfirmation(options: ConfirmDeleteOptions) {
			this.reset();
			this.options = options;
			this.open = true;
		}

		reset() {
			this.open = false;
			this.inputText = '';
			this.options = null;
		}

		confirm() {
			if (this.options?.input) {
				if (this.inputText !== this.options.input.confirmationText) {
					return;
				}
			}

			this.loading = true;
			this.options
				?.onConfirm()
				.then(() => {
					this.open = false;
				})
				.finally(() => {
					this.loading = false;
				});
		}

		cancel() {
			this.options?.onCancel?.();
			this.open = false;
		}
	}

	const dialogState = new ConfirmDeleteDialogState();

	export type ConfirmDeleteOptions = {
		title: string;
		description: string;
		skipConfirmation?: boolean;
		input?: {
			confirmationText: string;
		};
		confirm?: {
			text?: string;
		};
		cancel?: {
			text?: string;
		};
		onConfirm: () => Promise<unknown>;
		onCancel?: () => void;
	};

	export function confirmDelete(options: ConfirmDeleteOptions) {
		if (options.skipConfirmation) {
			options.onConfirm();
			return;
		}

		dialogState.newConfirmation(options);
	}
</script>

<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import { Input } from '$lib/components/ui/input';
	import Button from '../button/button.svelte';
</script>

<Modal.Root bind:open={dialogState.open}>
	<Modal.Content>
		<form
			method="POST"
			onsubmit={(e) => {
				e.preventDefault();
				dialogState.confirm();
			}}
			class="flex flex-col gap-4"
		>
			<Modal.Header>
				<Modal.Title>
					{dialogState.options?.title}
				</Modal.Title>
				<Modal.Description>
					{dialogState.options?.description}
				</Modal.Description>
			</Modal.Header>
			{#if dialogState.options?.input}
				<Input
					bind:value={dialogState.inputText}
					placeholder={`Enter \"${dialogState.options.input.confirmationText}\" to confirm.`}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							// for some reason without this the form will submit and the dialog will close immediately
							e.preventDefault();
							dialogState.confirm();
						}
					}}
				/>
			{/if}
			<Modal.Footer>
				<Button
					variant="outline"
					type="button"
					onclick={dialogState.cancel}
					class="md:block hidden"
				>
					{dialogState.options?.cancel?.text ?? 'Cancel'}
				</Button>
				<Button
					type="submit"
					variant="destructive"
					loading={dialogState.loading}
					disabled={dialogState.options?.input &&
						dialogState.inputText !== dialogState.options.input.confirmationText}
				>
					{dialogState.options?.confirm?.text ?? 'Delete'}
				</Button>
			</Modal.Footer>
		</form>
	</Modal.Content>
</Modal.Root>
