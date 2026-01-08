<script lang="ts">
	import { box } from 'svelte-toolbelt';
	import { useModelPicker } from '$lib/features/chat/components/prompt-input/prompt-input.svelte.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { useChatLayout } from '$lib/features/chat/chat.svelte.js';
	import { cn } from '$lib/utils';
	import * as NativeSelect from '$lib/components/ui/native-select';

	const chatLayoutState = useChatLayout();

	const modelPickerState = useModelPicker({
		models: box.with(() => chatLayoutState.models)
	});
</script>

<NativeSelect.Root
	bind:value={modelPickerState.rootState.opts.modelId.current}
	class={cn(buttonVariants({ variant: 'input' }), 'max-w-[175px] md:max-w-none')}
>
	{#each chatLayoutState.models.filter( (model) => chatLayoutState.userSettings?.favoriteModelIds?.includes(model.id) ) as model (model.id)}
		<NativeSelect.Option value={model.id}>{model.name}</NativeSelect.Option>
	{/each}
</NativeSelect.Root>
