<script lang="ts">
	import './layout.css';
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
	const reasoningEffort = new PersistedState<ReasoningEffort>('reasoningEffort', 'default');

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

	// set when the server tells us we are signed out so that we stop trying to refresh
	let signedOut = false;
	// set when convex dropped our auth (e.g. refreshing failed while offline) so that we can try again
	let authLost = false;
	let refreshing: Promise<string | null> | null = null;

	function expiresWithin(token: string, seconds: number) {
		try {
			const { exp } = jwtDecode(token);
			return exp !== undefined && exp * 1000 - Date.now() < seconds * 1000;
		} catch {
			return true;
		}
	}

	async function requestAccessToken(): Promise<string | null> {
		const MAX_ATTEMPTS = 5;
		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
			try {
				const response = await fetch('/auth/refresh', { cache: 'no-store' });
				if (response.status === 401) {
					signedOut = true;
					return null;
				}
				// transient failure, try again
				if (!response.ok) continue;
				const data = await response.json();
				const next = data.accessToken as string | undefined;
				if (!next) continue;
				accessTokenCtx.current = next;
				return next;
			} catch {
				// network error (offline, just woke from sleep, etc.)
			}
		}
		// we couldn't reach the server, keep using the current token if it's still valid
		if (accessToken && !expiresWithin(accessToken, 0)) return accessToken;
		return null;
	}

	// only ever have one refresh in flight
	function refreshAccessToken() {
		refreshing ??= requestAccessToken().finally(() => (refreshing = null));
		return refreshing;
	}

	function setConvexAuth() {
		client.setAuth(
			async ({ forceRefreshToken }) => {
				if (!accessToken || signedOut) return null;
				// convex asks for a forced refresh shortly before the token expires and when the server
				// rejects it. refreshing here (rather than only once the token is expired) keeps the
				// session alive for as long as the app is open.
				if (forceRefreshToken || expiresWithin(accessToken, 30)) {
					return refreshAccessToken();
				}
				return accessToken;
			},
			(isAuthenticated) => {
				authLost = !isAuthenticated;
			}
		);
	}

	setConvexAuth();

	function recoverAuth() {
		if (!authLost || signedOut || !accessToken) return;
		authLost = false;
		setConvexAuth();
	}

	const metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));
</script>

<MetaTags {...metaTags} />

<svelte:window ononline={recoverAuth} />
<svelte:document
	onvisibilitychange={() => document.visibilityState === 'visible' && recoverAuth()}
/>

<ModeWatcher />
<Startup />
<Toaster position="bottom-right" />

<ThemeProvider animate={true} defaultFontPreset={page.data.fontPreset}>
	<ConfirmDeleteDialog />
	{@render children()}
</ThemeProvider>
