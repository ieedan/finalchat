<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import OnboardingChooseModeView from './onboarding-choose-mode-view.svelte';
	import OnboardingSetupApiKey from './onboarding-setup-api-key.svelte';

	type Props = {
		userSettings: Doc<'userSettings'> | null | undefined;
	};

	let { userSettings }: Props = $props();
</script>

{#if userSettings !== undefined && !userSettings?.onboarding?.completed}
	<AlertDialog.Root open={true}>
		<AlertDialog.Content escapeKeydownBehavior="ignore" class="md:max-w-2xl w-full">
			{#if userSettings?.onboarding?.mode === undefined}
				<OnboardingChooseModeView />
			{:else if !userSettings.onboarding.setupApiKey}
				<OnboardingSetupApiKey />
			{/if}
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
