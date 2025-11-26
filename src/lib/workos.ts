import { WorkOS, type User } from "@workos-inc/node";

export type Session = {
    cookie: string;
    user: User;
}

export function createWorkOS(env: Record<string, string>) {
    return new WorkOS(env.WORKOS_API_KEY, {
        clientId: env.WORKOS_CLIENT_ID
    });
}

export async function getSession(workos: WorkOS, {
    getSessionCookie,
    setSessionCookie,
    cookiePassword,
}: {
    getSessionCookie: () => string | null;
    setSessionCookie: (sealedSession: string) => void;
    cookiePassword: string;
}): Promise<Session | null> {
    const sessionData = getSessionCookie();
    if (!sessionData) return null;
	const session = workos.userManagement.loadSealedSession({
		sessionData,
		cookiePassword: cookiePassword
	});

	const authenticatedResult = await session.authenticate();

	if (authenticatedResult.authenticated) return { cookie: sessionData, user: authenticatedResult.user };

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
        if (!authenticatedResult.sealedSession) return null;

		setSessionCookie(authenticatedResult.sealedSession);

		return { cookie: authenticatedResult.sealedSession, user: authenticatedResult.user };
	} catch {
		return null;
	}
}

export async function authenticateWithSessionCookie(workos: WorkOS, {
    sessionCookie,
    cookiePassword,
}: {
    sessionCookie: string;
    cookiePassword: string;
}): Promise<User | null> {
    const authenticatedResult = await workos.userManagement.authenticateWithSessionCookie({
        sessionData: sessionCookie,
        cookiePassword,
    });

    if (!authenticatedResult.authenticated) return null;

    return authenticatedResult.user;
}