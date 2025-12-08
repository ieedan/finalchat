import { useQuery } from 'convex-svelte';
import type { FunctionReference } from 'convex/server';
import { untrack } from 'svelte';

export type Query<Q extends FunctionReference<'query'>> = ReturnType<typeof useQuery<Q>>;

export function useQueryWithFallback<Q extends FunctionReference<'query'>>(
	func: Q,
	args: NoInfer<Q['_args']>,
	opts: {
		fallback: Q['_returnType'];
	}
): Query<Q> {
	let fallback = $state(opts.fallback);
	const result = useQuery(func, args, {
		initialData: fallback
	});

	const data = $derived.by(() => {
		if (result.data) {
			untrack(() => (fallback = result.data));
		}
		return result.data ?? fallback;
	});

	return {
		...result,
		get data() {
			return data;
		}
	};
}
