<script lang="ts">
	import { cn } from '$lib/utils';
	import * as Password from '$lib/components/ui/password';

	type Props = {
		apiKey: string;
	};

	let { apiKey = $bindable('') }: Props = $props();
</script>

<div
	data-maybe-invalid={apiKey && !apiKey.startsWith('sk-or-')}
	class={cn(
		'flex items-center border border-border rounded-md bg-transparent dark:bg-input/30 data-[maybe-invalid=true]:border-amber-500 data-[maybe-invalid=true]:ring-amber-500',
		'focus-within:ring-2 px-1 focus-within:ring-ring ring-offset-2 ring-offset-background transition-all'
	)}
>
	<Password.Root class="w-full">
		<Password.Input
			class="w-full border-none pl-1 bg-transparent! focus:ring-0!"
			placeholder="sk-or-v1-..."
			autocomplete="one-time-code"
			data-1p-ignore
			data-lpignore="true"
			bind:value={apiKey}
		>
			<Password.ToggleVisibility />
		</Password.Input>
	</Password.Root>
</div>
