import { AuthKit } from '@convex-dev/workos-authkit';
import { components } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { env } from '../env.convex';

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
	clientId: env.WORKOS_CLIENT_ID,
	apiKey: env.WORKOS_API_KEY,
	webhookSecret: env.WORKOS_WEBHOOK_SECRET
});
