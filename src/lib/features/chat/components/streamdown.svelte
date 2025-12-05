<script lang="ts">
	import { cn } from '$lib/utils';
	import { Streamdown } from 'svelte-streamdown';

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
	class={cn(
		'group-data-[message-role="user"]/message:[&_p,strong,li,h1,h2,h3,h4,h5,h6]:text-primary-foreground!',
		className
	)}
/>
