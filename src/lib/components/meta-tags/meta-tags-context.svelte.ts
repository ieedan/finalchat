import { Context } from 'runed';
import { onDestroy } from 'svelte';
import { type MetaTagsProps, deepMerge } from 'svelte-meta-tags';
import type { ReadableBox, ReadableBoxedValues } from 'svelte-toolbelt';
import { SvelteMap } from 'svelte/reactivity';

type MetaTagsOptions = { id: string } & ReadableBoxedValues<{
	metaTags: MetaTagsProps;
}>;

export class MetaTagsState {
	#metaTags = new SvelteMap<string, ReadableBox<MetaTagsProps>>();

	constructor(
		readonly opts: MetaTagsOptions,
		readonly rootState: MetaTagsState | null
	) {
		if (this.rootState !== null) {
			this.rootState.registerMetaTags(this.opts.id, this.opts.metaTags);
		} else {
			this.registerMetaTags(this.opts.id, this.opts.metaTags);
		}

		onDestroy(() => {
			if (this.rootState !== null) {
				this.rootState.unregisterMetaTags(this.opts.id);
			} else {
				this.unregisterMetaTags(this.opts.id);
			}
		});
	}

	registerMetaTags(key: string, props: ReadableBox<MetaTagsProps>) {
		this.#metaTags.set(key, props);
	}

	unregisterMetaTags(key: string) {
		this.#metaTags.delete(key);
	}

	metaTags: MetaTagsProps = $derived.by(() => {
		if (this.rootState !== null) {
			return this.rootState.metaTags;
		}

		const tags: MetaTagsProps[] = [];

		for (const box of this.#metaTags.values()) {
			tags.push(box.current);
		}

		return recursiveDeepMerge(...tags);
	});
}

function recursiveDeepMerge(...props: MetaTagsProps[]): MetaTagsProps {
	const [first, ...rest] = props;
	if (rest.length === 0) return first;
	return deepMerge(first, recursiveDeepMerge(...rest));
}

const ctx = new Context<MetaTagsState>('meta-tags-state');

export function useMetaTags(props: MetaTagsOptions) {
	const rootState = ctx.getOr(null);
	// if root state is null then we are the root
	if (rootState === null) return ctx.set(new MetaTagsState(props, null));
	// otherwise we are a child
	return new MetaTagsState(props, rootState);
}
