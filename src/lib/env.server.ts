import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const _env = createEnv({
	server: {
		PUBLIC_CONVEX_URL: z.url(),
		PUBLIC_WORKOS_CLIENT_ID: z.string(),
		WORKOS_API_KEY: z.string(),
		PUBLIC_WORKOS_REDIRECT_URI: z.url(),
		WORKOS_COOKIE_PASSWORD: z.string(),
		API_KEY_ENCRYPTION_KEY: z.string(),
		OPENROUTER_API_KEY: z.string()
	},
	emptyStringAsUndefined: true,
	runtimeEnv: process.env
});

export const env = {
	..._env,
	get PUBLIC_CONVEX_SITE_URL() {
		return _env.PUBLIC_CONVEX_URL.replace('.convex.cloud', '.convex.site');
	}
};
