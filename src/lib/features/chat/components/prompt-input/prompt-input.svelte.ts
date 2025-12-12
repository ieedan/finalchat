import type { ButtonElementProps } from '$lib/components/ui/button';
import { Context, watch } from 'runed';
import type { ReadableBoxedValues, WritableBoxedValues } from 'svelte-toolbelt';
import type { ClipboardEventHandler, KeyboardEventHandler } from 'svelte/elements';
import type { Model, ModelId } from '../../types';
import { SvelteMap } from 'svelte/reactivity';

export type OnSubmit = (opts: {
	input: string;
	modelId: ModelId;
	attachments: { url: string; key: string; mediaType: string }[];
}) => Promise<void>;

type PromptInputRootStateOptions = ReadableBoxedValues<{
	onSubmit: OnSubmit;
	submitOnEnter?: boolean;
	optimisticClear?: boolean;
	generating: boolean;
	onUpload: (files: File[]) => Promise<{ url: string; key: string; mediaType: string }[]>;
	onDeleteAttachment: (key: string) => Promise<void>;
}> &
	WritableBoxedValues<{
		value: string;
		modelId: ModelId | null;
		attachments: { url: string; key: string; mediaType: string }[];
	}>;

class PromptInputRootState {
	loading = $state(false);
	error = $state<string | null>(null);
	uploadingAttachments: Map<string, File> = new SvelteMap();
	textAreaRef = $state<HTMLTextAreaElement | null>(null);

	constructor(readonly opts: PromptInputRootStateOptions) {
		this.onUpload = this.onUpload.bind(this);
	}

	async onUpload(files: File[]) {
		try {
			// add the pending files
			for (const file of files) {
				this.uploadingAttachments.set(file.name, file);
			}

			const uploadedImages = await this.opts.onUpload.current?.(files);

			// remove the pending files
			for (const file of files) {
				this.uploadingAttachments.delete(file.name);
			}

			this.opts.attachments.current = [
				...this.opts.attachments.current,
				...uploadedImages.map((uploadedImage) => ({
					url: uploadedImage.url,
					key: uploadedImage.key,
					mediaType: uploadedImage.mediaType
				}))
			];
		} catch (error) {
			this.error = `Error uploading images: ${String(error)}`;
		}
	}

	async deleteAttachment(key: string) {
		await this.opts.onDeleteAttachment.current?.(key);
		this.opts.attachments.current = this.opts.attachments.current.filter(
			(attachment) => attachment.key !== key
		);
	}

	async submit(input: string) {
		const previousValue = this.opts.value.current;
		if (this.opts.optimisticClear?.current) {
			this.opts.value.current = '';
		}
		this.loading = true;

		try {
			this.error = null;

			await this.opts.onSubmit.current({
				input,
				modelId: this.opts.modelId.current!,
				attachments: this.opts.attachments.current
			});

			this.opts.value.current = '';
			this.opts.attachments.current = [];
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
	onpaste: ClipboardEventHandler<HTMLTextAreaElement> | null | undefined;
	ref: HTMLTextAreaElement | null;
}>;

class PromptInputTextareaState {
	constructor(
		readonly opts: PromptInputTextareaStateOptions,
		readonly rootState: PromptInputRootState
	) {
		watch(
			() => this.opts.ref.current,
			(ref: HTMLTextAreaElement | null) => {
				this.rootState.textAreaRef = ref;
			}
		);
	}

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

	onpaste(e: Parameters<ClipboardEventHandler<HTMLTextAreaElement>>[0]) {
		const clipboardData = e.clipboardData;
		if (clipboardData) {
			const items = Array.from(clipboardData.items);
			const images = items
				.filter((item) => item.type.startsWith('image/'))
				.map((item) => item.getAsFile())
				.filter((file) => file !== null);

			this.rootState.onUpload(images);
		}

		this.opts.onpaste?.current?.(e);
	}

	props = $derived.by(() => ({
		onkeydown: this.onkeydown.bind(this),
		onpaste: this.onpaste.bind(this),
		disabled: this.rootState.loading
	}));
}

class PromptInputAttachmentListState {
	constructor(readonly rootState: PromptInputRootState) {}
}

class PromptInputAttachmentButtonState {
	constructor(readonly rootState: PromptInputRootState) {}
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
		disabled:
			(this.rootState.opts.value.current.trim().length === 0 &&
				!this.rootState.opts.generating.current) ||
			this.opts.disabled.current,
		loading: this.rootState.loading,
		'data-generating': this.rootState.opts.generating.current
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
	constructor(
		readonly opts: ModelPickerStateOptions,
		readonly rootState: PromptInputRootState
	) {
		if (this.rootState.opts.modelId.current === null) {
			this.rootState.opts.modelId.current = this.opts.models.current[0].id;
		}
	}

	onSelect() {
		setTimeout(() => {
			this.rootState.textAreaRef?.focus();
		}, 0);
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

export function usePromptInputAttachmentList() {
	return new PromptInputAttachmentListState(ctx.get());
}

export function usePromptInputAttachmentButton() {
	return new PromptInputAttachmentButtonState(ctx.get());
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
