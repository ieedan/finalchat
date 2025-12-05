<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { Streamdown } from 'svelte-streamdown';
	import type { Infer } from 'convex/values';
	import type { ChatMessageAssistant, ChatMessageUser } from '$lib/convex/schema';
	import { useChatLayout, useContent } from './chat.svelte';
	import { AccessTokenCtx } from '$lib/context.svelte';

	const chatMessageVariants = tv({
		base: 'p-2 rounded-full',
		variants: {
			role: {
				user: 'bg-primary text-primary-foreground',
				assistant: 'bg-secondary text-secondary-foreground'
			}
		}
	});

	type Props = {
		message: Infer<typeof ChatMessageUser> | Infer<typeof ChatMessageAssistant>;
		driven: boolean;
	};

	let { message, driven }: Props = $props();

	const accessToken = AccessTokenCtx.get();
	const chatContext = useChatLayout();

	// svelte-ignore state_referenced_locally
	const content = useContent(message, { driven, accessToken: accessToken?.current, apiKey: chatContext.apiKey });
</script>

<div class={chatMessageVariants({ role: message.role })}>
	<Streamdown content={content.current} />
</div>
