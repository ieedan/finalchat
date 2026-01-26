import NodeRSA from 'node-rsa';
import { env } from '$lib/env.server';

export const key = new NodeRSA(env.API_KEY_ENCRYPTION_KEY);
