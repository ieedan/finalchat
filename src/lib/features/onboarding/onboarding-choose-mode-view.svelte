<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { api } from '$lib/convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';
	import ChooseModeField from '../modes/choose-mode-field.svelte';

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

<AlertDialog.Header>
	<AlertDialog.Title>Choose your experience</AlertDialog.Title>
	<AlertDialog.Description>
		You can always change this later in your settings.
	</AlertDialog.Description>
</AlertDialog.Header>
<div class="flex flex-col gap-4">
	<ChooseModeField bind:mode />
	<div class="flex items-center justify-between">
		<div></div>
		<Button class="gap-1" onClickPromise={submit}>
			Next
			<ArrowRightIcon />
		</Button>
	</div>
</div>
