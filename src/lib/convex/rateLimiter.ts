import { RateLimiter, MINUTE } from '@convex-dev/rate-limiter';
import { components } from './_generated/api';

export const rateLimiter = new RateLimiter(components.rateLimiter, {
	freeMessages: {
		kind: 'fixed window',
		rate: 1,
		period: MINUTE
	}
});
