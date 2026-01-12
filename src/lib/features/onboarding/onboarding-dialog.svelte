<script lang="ts">
	import * as Modal from '$lib/components/ui/modal';
	import type { User } from '$lib/convex/users.utils.js';
	import OnboardingChooseModeView from './onboarding-choose-mode-view.svelte';
	import OnboardingSetupApiKey from './onboarding-setup-api-key.svelte';

	type Props = {
		user: User | null | undefined;
	};

	let { user }: Props = $props();
</script>

{#if user && !user?.settings?.onboarding?.completed}
	<Modal.Root open={true}>
		<Modal.Content
			escapeKeydownBehavior="ignore"
			interactOutsideBehavior="ignore"
			class="md:max-w-2xl w-full"
		>
			{#if user?.settings?.onboarding?.mode === undefined}
				<OnboardingChooseModeView />
			{:else if !user.settings?.onboarding?.setupApiKey}
				<OnboardingSetupApiKey />
			{/if}
		</Modal.Content>
	</Modal.Root>
{/if}
