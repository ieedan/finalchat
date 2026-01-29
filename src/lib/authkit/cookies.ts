import type { Cookies } from '@sveltejs/kit';
export const SESSION_COOKIE_NAME = 'wos_session';

const SESSION_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax',
	maxAge: 60 * 60 * 24 * 400 // 400 days
} as const;

export function getSessionCookie(cookies: Cookies) {
	return cookies.get(SESSION_COOKIE_NAME);
}

export function setSessionCookie(cookies: Cookies, sealedSession: string) {
	cookies.set(SESSION_COOKIE_NAME, sealedSession, SESSION_COOKIE_OPTIONS);
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
}
