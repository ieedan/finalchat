<script lang="ts">
	import * as PromptInput from '$lib/features/chat/components/prompt-input';

	async function handleSubmit(input: string) {
		console.log('Submitted: ', input);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (Math.random() > 0.5) {
			throw new Error('An unknown error occurred while trying to submit your message.');
		}
	}

	let bannerDismissed = $state(false);
</script>

<div class="flex flex-col h-full items-center">
	<div class="flex flex-col w-full max-w-2xl flex-1 py-4">
		<div class="flex-1"></div>

		<PromptInput.Root onSubmit={handleSubmit}>
			<PromptInput.Banner dismissed={bannerDismissed} onDismiss={() => (bannerDismissed = true)}>
				<PromptInput.BannerContent>
					<span>You must be logged in to send messages.</span>
					<PromptInput.BannerDismiss />
				</PromptInput.BannerContent>
			</PromptInput.Banner>
			<PromptInput.Content>
				<PromptInput.Textarea placeholder="Ask me anything..." />
				<PromptInput.Footer class="justify-between">
					<div></div>
					<PromptInput.Submit />
				</PromptInput.Footer>
			</PromptInput.Content>
		</PromptInput.Root>
	</div>
</div>
