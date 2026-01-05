import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const _env = createEnv({
	client: {
		PUBLIC_CONVEX_URL: z.url(),
		PUBLIC_WORKOS_CLIENT_ID: z.string()
	},
	emptyStringAsUndefined: true,
	clientPrefix: 'PUBLIC_',
	runtimeEnv: import.meta.env
});

export const env = {
	..._env,
	get PUBLIC_CONVEX_SITE_URL() {
		return _env.PUBLIC_CONVEX_URL.replace('.convex.cloud', '.convex.site');
	}
};
