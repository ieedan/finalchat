import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		PUBLIC_CONVEX_URL: z.url(),
		PUBLIC_WORKOS_CLIENT_ID: z.string(),
		WORKOS_API_KEY: z.string(),
		PUBLIC_WORKOS_REDIRECT_URI: z.url(),
		WORKOS_COOKIE_PASSWORD: z.string()
	},
	emptyStringAsUndefined: true,
	runtimeEnv: process.env
});
