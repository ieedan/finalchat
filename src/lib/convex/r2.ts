import { R2 } from '@convex-dev/r2';
import { components } from './_generated/api';
import { env } from '../env.convex';

export const r2 = new R2(components.r2, {
	R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
	R2_ENDPOINT: env.R2_ENDPOINT,
	R2_BUCKET: env.R2_BUCKET
});

