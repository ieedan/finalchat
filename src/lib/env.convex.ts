import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		WORKOS_CLIENT_ID: z.string(),
		WORKOS_API_KEY: z.string(),
		WORKOS_WEBHOOK_SECRET: z.string(),
		R2_TOKEN: z.string(),
		R2_ACCESS_KEY_ID: z.string(),
		R2_SECRET_ACCESS_KEY: z.string(),
		R2_ENDPOINT: z.url(),
		R2_BUCKET: z.string(),
		GITHUB_TOKEN: z.optional(z.string()),
		// system environment variables https://docs.convex.dev/production/environment-variables#system-environment-variables
		CONVEX_CLOUD_URL: z.string(),
		CONVEX_SITE_URL: z.string()
	},
	emptyStringAsUndefined: true,
	runtimeEnv: process.env
});
