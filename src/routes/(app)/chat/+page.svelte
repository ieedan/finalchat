<script lang="ts">
	import * as PromptInput from '$lib/features/chat/components/prompt-input';

	async function handleSubmit(input: string) {}
</script>

<div class="flex flex-col h-full items-center">
	<div class="flex flex-col w-full max-w-2xl flex-1 py-4">
		<div class="flex-1"></div>

		<PromptInput.Root onSubmit={handleSubmit}>
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
