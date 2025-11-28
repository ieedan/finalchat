import type { useQuery } from 'convex-svelte';
import type { FunctionReference } from 'convex/server';

export type Query<Q extends FunctionReference<'query'>> = ReturnType<typeof useQuery<Q>>;