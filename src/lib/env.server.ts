import { createEnv } from '@t3-oss/env-core';
import { vercel } from '@t3-oss/env-core/presets-zod';
import { z } from 'zod';

const _env = createEnv({
	server: {
		// DO NOT REMOVE THIS DEFAULT VALUE. It will be replaced in the build process
		PUBLIC_CONVEX_URL: z.url().default('{{CONVEX_URL_FROM_CLI}}'),
		PUBLIC_WORKOS_CLIENT_ID: z.string(),
		WORKOS_API_KEY: z.string(),
		WORKOS_COOKIE_PASSWORD: z.string(),
		API_KEY_ENCRYPTION_KEY: z.string(),
		OPENROUTER_API_KEY: z.string()
	},
	emptyStringAsUndefined: true,
	runtimeEnv: process.env,
	extends: [vercel()]
});

export const env = {
	..._env,
	PUBLIC_CONVEX_SITE_URL: _env.PUBLIC_CONVEX_URL.replace('.convex.cloud', '.convex.site')
};
