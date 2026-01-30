<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/ibm-plex-sans';
	import '@fontsource-variable/atkinson-hyperlegible-mono';
	import '@fontsource-variable/atkinson-hyperlegible-next';
	import '@fontsource-variable/geist-mono';
	import favicon from '$lib/assets/favicon.svg';
	import { env } from '$lib/env.client';
	import { setupConvex } from 'convex-svelte';
	import { page } from '$app/state';
	import { jwtDecode } from 'jwt-decode';
	import { AccessTokenCtx, ModelIdCtx, ReasoningEffortCtx } from '$lib/context.svelte';
	import { box } from 'svelte-toolbelt';
	import { PersistedState } from 'runed';
	import { ConfirmDeleteDialog } from '$lib/components/ui/confirm-delete-dialog';
	import { Toaster } from '$lib/components/ui/sonner';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import { ThemeProvider } from '$lib/components/theme-provider';
	import Startup from '$lib/components/startup.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import type { ReasoningEffort } from '$lib/convex/schema';

	let { children, data } = $props();

	let accessToken = $derived<string | undefined>(page.data.accessToken as string | undefined);

	const accessTokenCtx = AccessTokenCtx.set(
		box.with(
			() => accessToken,
			(v) => (accessToken = v)
		)
	);

	const modelId = new PersistedState('modelId', null);
	const reasoningEffort = new PersistedState<ReasoningEffort>('reasoningEffort', 'none');

	ModelIdCtx.set(
		box.with(
			() => modelId.current,
			(v) => (modelId.current = v)
		)
	);
	ReasoningEffortCtx.set(
		box.with(
			() => reasoningEffort.current,
			(v) => (reasoningEffort.current = v)
		)
	);

	const client = setupConvex(env.PUBLIC_CONVEX_URL);
	client.setAuth(async () => {
		if (!accessToken) return null;
		const claims = jwtDecode(accessToken);
		// if expired
		if (claims.exp && claims.exp * 1000 < Date.now()) {
			const response = await fetch('/auth/refresh');
			const data = await response.json();
			accessTokenCtx.current = data.accessToken;
			return accessToken;
		}
		return accessToken;
	});

	const metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MetaTags {...metaTags} />

<ModeWatcher />
<Startup />
<ConfirmDeleteDialog />
<Toaster position="bottom-right" />

<ThemeProvider defaultFontPreset={page.data.fontPreset}>
	{@render children()}
</ThemeProvider>
