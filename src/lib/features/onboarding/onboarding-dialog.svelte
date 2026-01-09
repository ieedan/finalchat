<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import type { Doc } from '$lib/convex/_generated/dataModel';
	import type { User } from '@workos-inc/node';
	import OnboardingChooseModeView from './onboarding-choose-mode-view.svelte';
	import OnboardingSetupApiKey from './onboarding-setup-api-key.svelte';

	type Props = {
		user: User | null;
		userSettings: Doc<'userSettings'> | null | undefined;
	};

	let { user, userSettings }: Props = $props();
</script>

{#if user && userSettings !== undefined && !userSettings?.onboarding?.completed}
	<Modal.Root open={true}>
		<Modal.Content
			escapeKeydownBehavior="ignore"
			interactOutsideBehavior="ignore"
			class="md:max-w-2xl w-full"
		>
			{#if userSettings?.onboarding?.mode === undefined}
				<OnboardingChooseModeView />
			{:else if !userSettings.onboarding.setupApiKey}
				<OnboardingSetupApiKey />
			{/if}
		</Modal.Content>
	</Modal.Root>
{/if}
