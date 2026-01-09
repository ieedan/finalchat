import type { ButtonElementProps } from '$lib/components/ui/button';
import { Context, watch } from 'runed';
import type { ReadableBoxedValues, WritableBoxedValues } from 'svelte-toolbelt';
import type { ClipboardEventHandler, KeyboardEventHandler } from 'svelte/elements';
import type { Model, ModelId } from '../../types';
import { SvelteMap } from 'svelte/reactivity';
import imageCompression from 'browser-image-compression';
import { IsMobile } from '$lib/hooks/is-mobile.svelte';

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
	isMobile: IsMobile;

	constructor(readonly opts: PromptInputRootStateOptions) {
		this.onUpload = this.onUpload.bind(this);
		this.isMobile = new IsMobile();
	}

	async onUpload(files: File[]) {
		try {
			// add the pending files
			for (const file of files) {
				let compressedFile: File = file;
				if (file.type.startsWith('image/')) {
					compressedFile = await imageCompression(file, {
						maxSizeMB: 1,
						maxWidthOrHeight: 1920
					});
				}

				this.uploadingAttachments.set(file.name, compressedFile);
			}

			const uploadedImages = await this.opts.onUpload.current?.(
				this.uploadingAttachments.values().toArray()
			);

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
		if (this.opts.value.current.trim().length === 0) return;
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
		if (e.key !== 'Enter') return;
		if (e.shiftKey) return;

		// On mobile, always submit on Enter (no modifier keys available)
		// On desktop, submit on Ctrl/Cmd+Enter OR plain Enter if submitOnEnter is true
		const shouldSubmit =
			e.metaKey ||
			e.ctrlKey ||
			this.rootState.isMobile.current ||
			this.rootState.opts.submitOnEnter?.current;

		if (shouldSubmit) {
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
			this.rootState.uploadingAttachments.size > 0 ||
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
		// Watch for changes to models and ensure modelId is always valid
		watch(
			() => [this.opts.models.current, this.rootState.opts.modelId.current] as const,
			([models, modelId]) => {
				if (models.length === 0) return;

				// If modelId is null or not in the available models, set to first model
				if (modelId === null || !models.some((m) => m.id === modelId)) {
					this.rootState.opts.modelId.current = models[0].id;
				}
			}
		);
	}

	onSelect() {
		setTimeout(() => {
			this.rootState.textAreaRef?.focus();
		}, 0);
	}
}

export const PromptInputCtx = new Context<PromptInputRootState>('prompt-input-root-state');
const BannerCtx = new Context<PromptInputBannerState>('prompt-input-banner-state');

export function usePromptInput(props: PromptInputRootStateOptions) {
	return PromptInputCtx.set(new PromptInputRootState(props));
}

export function usePromptInputTextarea(props: PromptInputTextareaStateOptions) {
	return new PromptInputTextareaState(props, PromptInputCtx.get());
}

export function usePromptInputAttachmentList() {
	return new PromptInputAttachmentListState(PromptInputCtx.get());
}

export function usePromptInputAttachmentButton() {
	return new PromptInputAttachmentButtonState(PromptInputCtx.get());
}

export function usePromptInputSubmit(props: PromptInputSubmitStateOptions) {
	return new PromptInputSubmitState(props, PromptInputCtx.get());
}

export function usePromptInputBanner(props: PromptInputBannerStateOptions) {
	return BannerCtx.set(new PromptInputBannerState(props, PromptInputCtx.get()));
}

export function usePromptInputBannerDismiss(props: PromptInputBannerDismissStateOptions) {
	return new PromptInputBannerDismissState(props, BannerCtx.get());
}

export function useModelPicker(props: ModelPickerStateOptions) {
	return new ModelPickerState(props, PromptInputCtx.get());
}
