// See https://svelte.dev/docs/kit/types#app.d.ts

import type { ConvexClient } from 'convex/browser';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('@workos/authkit-sveltekit').AuthKitAuth;
			convex: ConvexClient;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
