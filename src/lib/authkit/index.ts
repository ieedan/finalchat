import { env } from '$lib/env.server';
import { json, redirect, type Handle, type RequestEvent } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import {
	WorkOS,
	type AuthenticationResponse,
	type Impersonator,
	type User
} from '@workos-inc/node';
import { clearSessionCookie, getSessionCookie, setSessionCookie } from './cookies';

export type AuthKitAuthHandler = () => Promise<AuthResult | null>;

export type AuthResult = {
	accessToken?: string;
	impersonator?: Impersonator;
	organizationId?: string;
	permissions?: string[];
	role?: string;
	sessionId?: string;
	user: User;
};

export type AuthKitOptions = {
	/**
	 * From WorkOS Dashboard
	 */
	clientId: string;
	/**
	 * From WorkOS Dashboard
	 */
	apiKey: string;
	/**
	 * Provide a string for a path with event.url.origin as the origin or a complete URL
	 */
	redirectUri: string | URL;
	/**
	 * Random secret string used to seal the session cookie
	 */
	cookiePassword: string;
	/**
	 * Refresh the access token when it expires within this many seconds instead of waiting until
	 * it has already expired. Defaults to 60.
	 */
	refreshLeewaySeconds?: number;
	hooks?: {
		onAuthenticated?: (opts: { event: RequestEvent; auth: AuthResult }) => Promise<void>;
	};
};

const REFRESH_ATTEMPTS = 3;

function expiresWithin(accessToken: string, seconds: number) {
	try {
		const { exp } = jwtDecode(accessToken);
		if (!exp) return false;
		return exp * 1000 - Date.now() < seconds * 1000;
	} catch {
		return true;
	}
}

export class AuthKitAuth {
	private workos: WorkOS;
	constructor(private opts: AuthKitOptions) {
		this.workos = new WorkOS(env.WORKOS_API_KEY, {
			clientId: env.PUBLIC_WORKOS_CLIENT_ID
		});
	}

	goToSignInUrl() {
		return (event: RequestEvent) => {
			const redirectUri =
				this.opts.redirectUri instanceof URL
					? this.opts.redirectUri.toString()
					: new URL(this.opts.redirectUri, event.url.origin).toString();
			const authorizationUrl = this.workos.userManagement.getAuthorizationUrl({
				provider: 'authkit',
				redirectUri,
				clientId: this.opts.clientId
			});

			redirect(302, authorizationUrl);
		};
	}

	handleCallback() {
		return async (event: RequestEvent) => {
			const code = event.url.searchParams.get('code');
			if (!code) {
				return new Response('No code provided', { status: 400 });
			}

			let authenticationResponse: AuthenticationResponse;
			try {
				authenticationResponse = await this.workos.userManagement.authenticateWithCode({
					code,
					clientId: this.opts.clientId,
					session: {
						sealSession: true,
						cookiePassword: this.opts.cookiePassword
					}
				});
			} catch {
				return this.goToSignInUrl()(event);
			}

			const { sealedSession } = authenticationResponse;

			setSessionCookie(event.cookies, sealedSession!);

			redirect(302, '/');
		};
	}

	handleSignOut() {
		return async (event: RequestEvent) => {
			const session = this.workos.userManagement.loadSealedSession({
				sessionData: getSessionCookie(event.cookies)!,
				cookiePassword: this.opts.cookiePassword
			});

			const url = await session.getLogoutUrl();

			clearSessionCookie(event.cookies);

			redirect(302, url);
		};
	}

	handle() {
		return async ({ event, resolve }: Parameters<Handle>[0]) => {
			// memoize so that concurrent loads in the same request don't each refresh the session
			let authPromise: Promise<AuthResult | null> | undefined;
			event.locals.auth = () => (authPromise ??= this.auth(event));

			return resolve(event);
		};
	}

	withAuth<T>(handler: (opts: { event: RequestEvent; auth: AuthResult }) => Promise<T>) {
		return async (event: RequestEvent): Promise<T> => {
			const auth = await this.auth(event);
			if (!auth) return this.goToSignInUrl()(event);
			return handler({ event, auth });
		};
	}

	/**
	 * Refreshes the session and returns a fresh access token. Responds with 401 (rather than
	 * redirecting) when the user is no longer signed in so that client side callers can tell
	 * the difference between being signed out and a transient failure (503).
	 */
	handleRefresh() {
		return async (event: RequestEvent) => {
			const headers = { 'cache-control': 'no-store' };
			const sessionData = getSessionCookie(event.cookies);
			if (!sessionData) return json({ error: 'unauthenticated' }, { status: 401, headers });

			const result = await this.refresh(event, sessionData);
			if (result.status === 'ok') {
				return json({ accessToken: result.auth.accessToken }, { headers });
			}
			if (result.status === 'signed_out') {
				return json({ error: 'unauthenticated' }, { status: 401, headers });
			}
			return json({ error: 'refresh_failed' }, { status: 503, headers });
		};
	}

	private async auth(event: RequestEvent): Promise<AuthResult | null> {
		const sessionData = getSessionCookie(event.cookies);
		if (!sessionData) return null;
		const session = this.workos.userManagement.loadSealedSession({
			sessionData,
			cookiePassword: this.opts.cookiePassword
		});

		let authenticatedResult: Awaited<ReturnType<typeof session.authenticate>>;
		try {
			authenticatedResult = await session.authenticate();
		} catch {
			// the cookie couldn't be unsealed
			return null;
		}

		if (
			!authenticatedResult.authenticated &&
			authenticatedResult.reason === 'no_session_cookie_provided'
		) {
			return null;
		}

		const leeway = this.opts.refreshLeewaySeconds ?? 60;
		if (
			authenticatedResult.authenticated &&
			!expiresWithin(authenticatedResult.accessToken, leeway)
		) {
			return this.authenticated(event, {
				user: authenticatedResult.user,
				accessToken: authenticatedResult.accessToken,
				impersonator: authenticatedResult.impersonator,
				organizationId: authenticatedResult.organizationId,
				permissions: authenticatedResult.permissions,
				role: authenticatedResult.role,
				sessionId: authenticatedResult.sessionId
			});
		}

		const result = await this.refresh(event, sessionData);
		if (result.status === 'ok') return result.auth;

		// refreshing failed for a transient reason (network error, rate limit, WorkOS outage) but the
		// current access token is still valid so keep using it instead of signing the user out
		if (result.status === 'error' && authenticatedResult.authenticated) {
			return this.authenticated(event, {
				user: authenticatedResult.user,
				accessToken: authenticatedResult.accessToken,
				impersonator: authenticatedResult.impersonator,
				organizationId: authenticatedResult.organizationId,
				permissions: authenticatedResult.permissions,
				role: authenticatedResult.role,
				sessionId: authenticatedResult.sessionId
			});
		}

		return null;
	}

	/**
	 * Exchanges the refresh token for a new session. Only a definitive answer from WorkOS (e.g.
	 * `invalid_grant`) is treated as being signed out, transient failures are retried.
	 */
	private async refresh(
		event: RequestEvent,
		sessionData: string
	): Promise<{ status: 'ok'; auth: AuthResult } | { status: 'signed_out' } | { status: 'error' }> {
		for (let attempt = 0; attempt < REFRESH_ATTEMPTS; attempt++) {
			if (attempt > 0) await new Promise((r) => setTimeout(r, 250 * 2 ** (attempt - 1)));

			const session = this.workos.userManagement.loadSealedSession({
				sessionData,
				cookiePassword: this.opts.cookiePassword
			});

			let refreshResult: Awaited<ReturnType<typeof session.refresh>>;
			try {
				refreshResult = await session.refresh();
			} catch (e) {
				console.error(`Failed to refresh session (attempt ${attempt + 1})`, e);
				continue;
			}

			if (!refreshResult.authenticated || !refreshResult.session) {
				return { status: 'signed_out' };
			}

			setSessionCookie(event.cookies, refreshResult.sealedSession!);

			return {
				status: 'ok',
				auth: this.authenticated(event, {
					user: refreshResult.user,
					accessToken: refreshResult.session.accessToken,
					impersonator: refreshResult.impersonator,
					organizationId: refreshResult.organizationId,
					permissions: refreshResult.permissions,
					role: refreshResult.role,
					sessionId: refreshResult.sessionId
				})
			};
		}

		return { status: 'error' };
	}

	private authenticated(event: RequestEvent, auth: AuthResult) {
		this.opts.hooks?.onAuthenticated?.({ event, auth });
		return auth;
	}
}
