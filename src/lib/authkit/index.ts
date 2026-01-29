import { env } from '$lib/env.server';
import { redirect, type Handle, type RequestEvent } from '@sveltejs/kit';
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
	hooks?: {
		onAuthenticated?: (opts: { event: RequestEvent; auth: AuthResult }) => Promise<void>;
	};
};

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
			event.locals.auth = () => this.auth(event);

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

	private async auth(event: RequestEvent): Promise<AuthResult | null> {
		const sessionData = getSessionCookie(event.cookies);
		if (!sessionData) return null;
		const session = this.workos.userManagement.loadSealedSession({
			sessionData,
			cookiePassword: this.opts.cookiePassword
		});

		const authenticatedResult = await session.authenticate();

		if (authenticatedResult.authenticated) {
			const authResult: AuthResult = {
				user: authenticatedResult.user,
				accessToken: authenticatedResult.accessToken,
				impersonator: authenticatedResult.impersonator,
				organizationId: authenticatedResult.organizationId,
				permissions: authenticatedResult.permissions,
				role: authenticatedResult.role,
				sessionId: authenticatedResult.sessionId
			};
			this.opts.hooks?.onAuthenticated?.({ event, auth: authResult });
			return authResult;
		}

		if (
			!authenticatedResult.authenticated &&
			authenticatedResult.reason === 'no_session_cookie_provided'
		) {
			return null;
		}

		// attempt to refresh the session
		try {
			const authenticatedResult = await session.refresh();

			if (!authenticatedResult.authenticated) return null;
			if (!authenticatedResult.session) return null;

			setSessionCookie(event.cookies, authenticatedResult.sealedSession!);

			const authResult: AuthResult = {
				user: authenticatedResult.user,
				accessToken: authenticatedResult.session?.accessToken,
				impersonator: authenticatedResult.impersonator,
				organizationId: authenticatedResult.organizationId,
				permissions: authenticatedResult.permissions,
				role: authenticatedResult.role,
				sessionId: authenticatedResult.sessionId
			};
			this.opts.hooks?.onAuthenticated?.({ event, auth: authResult });
			return authResult;
		} catch {
			return null;
		}
	}
}
