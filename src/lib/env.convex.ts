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
		CONVEX_ENVIRONMENT: z
			.enum(['production', 'development'])
			.default(
				process.env.CONVEX_CLOUD_URL === 'https://rightful-grouse-394.convex.cloud'
					? 'production'
					: 'development'
			)
	},
	emptyStringAsUndefined: true,
	runtimeEnv: process.env
});
