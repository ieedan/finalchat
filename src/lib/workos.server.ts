import { AuthKitAuth } from './authkit';
import { env } from './env.server';

export const authKit = new AuthKitAuth({
	apiKey: env.WORKOS_API_KEY,
	clientId: env.PUBLIC_WORKOS_CLIENT_ID,
	redirectUri: '/auth/callback',
	cookiePassword: env.WORKOS_COOKIE_PASSWORD,
	hooks: {
		onAuthenticated: async ({ event, auth }) => {
			event.locals.convex.setAuth(async () => auth.accessToken);
		}
	}
});
