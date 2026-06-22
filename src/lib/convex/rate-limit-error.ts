import { ConvexError } from 'convex/values';

/**
 * Structured payload carried by a rate-limit {@link ConvexError}. We send the
 * remaining duration (rather than a pre-formatted string) so the client can
 * render a live countdown that ticks down to zero.
 */
export type RateLimitErrorData = {
	kind: 'rate_limit';
	/** Human readable message (used as a fallback when no countdown is rendered). */
	message: string;
	/** Milliseconds until the user is allowed to retry. */
	retryAfter: number;
};

export function isRateLimitErrorData(data: unknown): data is RateLimitErrorData {
	return (
		typeof data === 'object' &&
		data !== null &&
		(data as { kind?: unknown }).kind === 'rate_limit' &&
		typeof (data as { message?: unknown }).message === 'string' &&
		typeof (data as { retryAfter?: unknown }).retryAfter === 'number'
	);
}

/**
 * Extracts rate-limit data from a thrown error or its `cause`. The original
 * {@link ConvexError} is preserved as the `cause` when it is re-thrown as a
 * plain `Error`, so we look in both places.
 */
export function getRateLimitErrorData(error: unknown): RateLimitErrorData | null {
	if (error instanceof ConvexError && isRateLimitErrorData(error.data)) {
		return error.data;
	}
	if (
		error instanceof Error &&
		error.cause instanceof ConvexError &&
		isRateLimitErrorData(error.cause.data)
	) {
		return error.cause.data;
	}
	return null;
}

/** Resolves a human readable message from arbitrary {@link ConvexError} data. */
export function convexErrorMessage(data: unknown): string {
	if (typeof data === 'string') return data;
	if (isRateLimitErrorData(data)) return data.message;
	return 'Something went wrong.';
}
