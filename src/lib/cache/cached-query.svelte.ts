import { useQuery as convexUseQuery } from 'convex-svelte';
import { LocalStorageCache } from './local-storage-cache.js';
import { getFunctionName, type FunctionArgs, type FunctionReference } from 'convex/server';
import { extract, watch } from 'runed';
import type { ConvexClient } from 'convex/browser';

export interface CachedQueryOptions {
	cacheKey?: string;
	ttl?: number;
	staleWhileRevalidate?: boolean;
	enabled?: boolean;
}

export interface QueryResult<T> {
	data: T | undefined;
	error: Error | undefined;
	isLoading: boolean;
	isStale: boolean;
}

export const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week

const globalCache = new LocalStorageCache('convex-query-cache');

export function useCachedQuery<Query extends FunctionReference<'query'>>(
	query: Query,
	queryArgs: FunctionArgs<Query> | (() => FunctionArgs<Query>),
	options: CachedQueryOptions = {}
): QueryResult<Query['_returnType']> {
	const {
		cacheKey,
		ttl = DEFAULT_TTL, // 1 week default
		// staleWhileRevalidate = true,
		enabled = true
	} = options;

	// Generate cache key from query reference and args
	const key = $derived(getKey(query, queryArgs, cacheKey));

	// Get cached data
	const cachedData = $derived(enabled ? globalCache.get(key) : undefined);

	// Convex query, used as soon as possible
	const convexResult = convexUseQuery(query, queryArgs, {
		// enabled: enabled && (!cachedData || !staleWhileRevalidate),
	});

	const shouldUseCached = $derived(cachedData !== undefined && convexResult.isLoading);

	// Cache fresh data when available
	watch(
		() => $state.snapshot(convexResult.data),
		(data) => {
			if (data === undefined || !enabled) return;
			globalCache.set(key, data, ttl);
		}
	);

	return {
		get data() {
			return shouldUseCached ? cachedData : convexResult.data;
		},
		get error() {
			return convexResult.error;
		},
		get isLoading() {
			return shouldUseCached ? false : convexResult.isLoading;
		},
		get isStale() {
			return shouldUseCached && convexResult.isLoading;
		}
	};
}

export function invalidateQuery(query: FunctionReference<'query'>, queryArgs?: unknown): void {
	const key = `${getFunctionName(query)}:${JSON.stringify(queryArgs || {})}`;
	globalCache.delete(key);
}

export function clearQueryCache(): void {
	globalCache.clear();
}

export function getKey<Query extends FunctionReference<'query'>>(
	query: Query,
	queryArgs: Query['_args'],
	cacheKey?: string
): string {
	return cacheKey || `${getFunctionName(query)}:${JSON.stringify(extract(queryArgs))}`;
}

/** Warms the global cache */
export async function warm<Query extends FunctionReference<'query'>>(
	client: ConvexClient,
	query: Query,
	queryArgs?: Query['_args']
): Promise<Query['_returnType']> {
	const key = getKey(query, queryArgs);

	if (globalCache.has(key)) return globalCache.get(key);

	const data = await client.query(query, queryArgs);

	globalCache.set(key, data, DEFAULT_TTL);

	return data;
}

export { globalCache as queryCache };
