<script lang="ts">
	import { box, type WithChildren } from 'svelte-toolbelt';
	import { useMetaTags } from './meta-tags-context.svelte.js';
	import { MetaTags, type MetaTagsProps } from 'svelte-meta-tags';

	const id = $props.id();

	let { children, ...metaTags }: WithChildren<MetaTagsProps> = $props();

	const metaTagsState = useMetaTags({ id, metaTags: box.with(() => metaTags) });
</script>

{#if metaTagsState.rootState === null}
	<MetaTags {...metaTagsState.metaTags} />
{/if}

{@render children?.()}
