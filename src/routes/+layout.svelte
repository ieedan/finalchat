<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { env } from '$lib/env.client';
	import { setupConvex } from 'convex-svelte';
	import { page } from '$app/state';
	import { jwtDecode } from 'jwt-decode';
	import { AccessTokenCtx } from '$lib/context.svelte';
	import { box } from 'svelte-toolbelt';

	let { children } = $props();

	let accessToken = $derived<string | undefined>(page.data.accessToken as string | undefined);

	const accessTokenCtx = AccessTokenCtx.set(
		box.with(
			() => accessToken,
			(v) => (accessToken = v)
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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

{@render children()}
