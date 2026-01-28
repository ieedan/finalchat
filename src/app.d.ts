// See https://svelte.dev/docs/kit/types#app.d.ts

import type { ConvexClient } from 'convex/browser';
import type { AuthKitAuthHandler } from '$lib/authkit';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: AuthKitAuthHandler;
			convex: ConvexClient;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
