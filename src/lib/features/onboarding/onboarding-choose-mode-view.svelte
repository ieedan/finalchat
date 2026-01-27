<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArrowRightIcon from 'remixicon-svelte/icons/arrow-right-line';
	import { api } from '$lib/convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';
	import ChooseModeField from '../modes/choose-mode-field.svelte';
	import * as Modal from '$lib/components/ui/modal';

	let mode = $state<'basic' | 'advanced'>('advanced');

	const convex = useConvexClient();

	async function submit() {
		try {
			await convex.mutation(api.userSettings.updateMode, {
				mode
			});
		} catch (error) {
			console.error(error);
		}
	}
</script>

<Modal.Header>
	<Modal.Title>Choose your experience</Modal.Title>
	<Modal.Description>You can always change this later in your settings.</Modal.Description>
</Modal.Header>
<div class="flex flex-col gap-4">
	<ChooseModeField bind:mode />
	<div class="flex items-center justify-end">
		<Button class="gap-1 w-full md:w-auto" onClickPromise={submit}>
			Next
			<ArrowRightIcon />
		</Button>
	</div>
</div>
