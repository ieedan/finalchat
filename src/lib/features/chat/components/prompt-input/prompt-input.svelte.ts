import type { ButtonElementProps } from '$lib/components/ui/button';
import { Context } from 'runed';
import type { ReadableBoxedValues, WritableBoxedValues } from 'svelte-toolbelt';
import type { KeyboardEventHandler } from 'svelte/elements';

type PromptInputRootStateOptions = ReadableBoxedValues<{
	onSubmit: (input: string) => Promise<void>;
	submitOnEnter?: boolean;
}> &
	WritableBoxedValues<{
		value: string;
	}>;

class PromptInputRootState {
	loading = $state(false);

	constructor(readonly opts: PromptInputRootStateOptions) {}

	submit(input: string) {
		this.loading = true;
		this.opts.onSubmit.current(input).finally(() => {
			this.loading = false;
		});
	}
}

type PromptInputTextareaStateOptions = ReadableBoxedValues<{
	onkeydown: KeyboardEventHandler<HTMLTextAreaElement> | null | undefined;
}>;

class PromptInputTextareaState {
	constructor(
		readonly opts: PromptInputTextareaStateOptions,
		readonly rootState: PromptInputRootState
	) {}

	onkeydown(e: Parameters<KeyboardEventHandler<HTMLTextAreaElement>>[0]) {
		if (e.key === 'Enter' && ((e.metaKey || e.ctrlKey) || this.rootState.opts.submitOnEnter?.current)) {
            console.log('hit it')
			e.preventDefault();
			this.rootState.submit(this.rootState.opts.value.current);
		}

		this.opts.onkeydown?.current?.(e);
	}

	props = $derived.by(() => ({
		onkeydown: this.onkeydown.bind(this),
        disabled: this.rootState.loading
	}));
}

type PromptInputSubmitStateOptions = ReadableBoxedValues<{
	disabled: boolean | null | undefined;
	onclick: ButtonElementProps['onclick'];
}>;

class PromptInputSubmitState {
	constructor(
		readonly opts: PromptInputSubmitStateOptions,
		readonly rootState: PromptInputRootState
	) {}

	onclick(e: Parameters<NonNullable<ButtonElementProps['onclick']>>[0]) {
		this.rootState.submit(this.rootState.opts.value.current);
		this.opts.onclick?.current?.(e);
	}

	props = $derived.by(() => ({
		onclick: this.onclick.bind(this),
		disabled: this.rootState.opts.value.current.trim().length === 0 || this.opts.disabled.current,
        loading: this.rootState.loading
	}));
}

const ctx = new Context<PromptInputRootState>('prompt-input-root-state');

export function usePromptInput(props: PromptInputRootStateOptions) {
	return ctx.set(new PromptInputRootState(props));
}

export function usePromptInputTextarea(props: PromptInputTextareaStateOptions) {
	return new PromptInputTextareaState(props, ctx.get());
}

export function usePromptInputSubmit(props: PromptInputSubmitStateOptions) {
	return new PromptInputSubmitState(props, ctx.get());
}
