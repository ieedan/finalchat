import { env } from '$lib/env.server';
import type { RequestEvent } from '@sveltejs/kit';
import { createWorkOS, getSession, type Session } from './workos';

export const SESSION_COOKIE_NAME = 'wos-session';

export const workos = createWorkOS(env);

const SESSION_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax'
} as const;

export function getSessionCookie(cookies: RequestEvent['cookies']) {
	return cookies.get(SESSION_COOKIE_NAME);
}

export function setSessionCookie(cookies: RequestEvent['cookies'], sealedSession: string) {
	cookies.set(SESSION_COOKIE_NAME, sealedSession, SESSION_COOKIE_OPTIONS);
}

export function clearSessionCookie(cookies: RequestEvent['cookies']) {
	cookies.delete(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
}

export async function auth(event: RequestEvent): Promise<Session | null> {
	return getSession(workos, {
		getSessionCookie: () => getSessionCookie(event.cookies) ?? null,
		setSessionCookie: (sealedSession) => setSessionCookie(event.cookies, sealedSession),
		cookiePassword: env.WORKOS_COOKIE_PASSWORD
	});
}
