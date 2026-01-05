/**
 * Don't remove this file. We populate it with the convex URL locally from the env vars
 * which seems stupid just to re-export, but during build time for previews, we replace this
 * with the Convex URL from the deployment.
 */
import { env } from '$lib/env.server';
export const SERVER_CONVEX_URL = env.PUBLIC_CONVEX_URL;
