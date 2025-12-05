import type { ButtonElementProps } from '$lib/components/ui/button';
import { Context } from 'runed';
import type { ReadableBoxedValues, WritableBoxedValues } from 'svelte-toolbelt';
import type { KeyboardEventHandler } from 'svelte/elements';
import type { Model, ModelId } from '../../types';

export type OnSubmit = (opts: { input: string; modelId: ModelId }) => Promise<void>;

type PromptInputRootStateOptions = ReadableBoxedValues<{
	onSubmit: OnSubmit;
	submitOnEnter?: boolean;
	optimisticClear?: boolean;
}> &
	WritableBoxedValues<{
		value: string;
		modelId: ModelId | null;
	}>;

class PromptInputRootState {
	loading = $state(false);
	error = $state<string | null>(null);

	constructor(readonly opts: PromptInputRootStateOptions) {}

	async submit(input: string) {
		const previousValue = this.opts.value.current;
		if (this.opts.optimisticClear?.current) {
			this.opts.value.current = '';
		}
		this.loading = true;

		try {
			this.error = null;

			await this.opts.onSubmit.current({ input, modelId: this.opts.modelId.current! });

			this.opts.value.current = '';
		} catch (error) {
			this.error =
				error instanceof Error
					? error.message
					: 'An unknown error occurred while trying to submit your message.';
			this.opts.value.current = previousValue;
		} finally {
			this.loading = false;
		}
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
		if (
			e.key === 'Enter' &&
			(e.metaKey || e.ctrlKey || this.rootState.opts.submitOnEnter?.current)
		) {
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

type PromptInputBannerStateOptions = ReadableBoxedValues<{
	onDismiss: () => void;
}>;

class PromptInputBannerState {
	constructor(
		readonly opts: PromptInputBannerStateOptions,
		readonly rootState: PromptInputRootState
	) {}
}

type PromptInputBannerDismissStateOptions = ReadableBoxedValues<{
	onclick: ButtonElementProps['onclick'];
}>;

class PromptInputBannerDismissState {
	constructor(
		readonly opts: PromptInputBannerDismissStateOptions,
		readonly rootState: PromptInputBannerState
	) {}

	onclick(e: Parameters<NonNullable<ButtonElementProps['onclick']>>[0]) {
		this.rootState.opts.onDismiss.current?.();
		this.opts.onclick?.current?.(e);
	}

	props = $derived.by(() => ({
		onclick: this.onclick.bind(this)
	}));
}

type ModelPickerStateOptions = ReadableBoxedValues<{
	models: Model[];
}>;

class ModelPickerState {
	constructor(readonly opts: ModelPickerStateOptions, readonly rootState: PromptInputRootState) {
		if (this.rootState.opts.modelId.current === null) {
			this.rootState.opts.modelId.current = this.opts.models.current[0].id;
		}
	}
}

const ctx = new Context<PromptInputRootState>('prompt-input-root-state');
const bannerCtx = new Context<PromptInputBannerState>('prompt-input-banner-state');

export function usePromptInput(props: PromptInputRootStateOptions) {
	return ctx.set(new PromptInputRootState(props));
}

export function usePromptInputTextarea(props: PromptInputTextareaStateOptions) {
	return new PromptInputTextareaState(props, ctx.get());
}

export function usePromptInputSubmit(props: PromptInputSubmitStateOptions) {
	return new PromptInputSubmitState(props, ctx.get());
}

export function usePromptInputBanner(props: PromptInputBannerStateOptions) {
	return bannerCtx.set(new PromptInputBannerState(props, ctx.get()));
}

export function usePromptInputBannerDismiss(props: PromptInputBannerDismissStateOptions) {
	return new PromptInputBannerDismissState(props, bannerCtx.get());
}

export function useModelPicker(props: ModelPickerStateOptions) {
	return new ModelPickerState(props, ctx.get());
}
