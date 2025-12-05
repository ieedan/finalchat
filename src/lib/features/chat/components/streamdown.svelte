<script lang="ts">
	import { cn } from '$lib/utils';
	import { Streamdown } from 'svelte-streamdown';
	import Code from 'svelte-streamdown/code';

	type Props = {
		content: string;
		class?: string;
		animationEnabled?: boolean;
	};

	let { content, class: className, animationEnabled = true }: Props = $props();
</script>

<Streamdown
	{content}
	animation={{
		enabled: animationEnabled,
		type: 'slideUp',
		animateOnMount: true
	}}
	baseTheme="shadcn"
	class={cn(className)}
	components={{
		code: Code
	}}
/>
