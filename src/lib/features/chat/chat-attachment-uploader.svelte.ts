import { api } from '$lib/convex/_generated/api';
import { useUploadFile } from '@convex-dev/r2/svelte';
import { useConvexClient } from 'convex-svelte';
import type { ConvexClient } from 'convex/browser';
import {
	guessMediaTypeFromFileName,
	isImageAttachmentMediaType
} from '$lib/utils/chat-attachment-types';

export type UploadedAttachment = {
	url: string;
	key: string;
	mediaType: string;
	width?: number;
	height?: number;
};

async function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
	const objectUrl = URL.createObjectURL(file);
	try {
		const img = new Image();
		const loaded = new Promise<{ width: number; height: number } | null>((resolve) => {
			img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
			img.onerror = () => resolve(null);
		});
		img.src = objectUrl;
		return await loaded;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

export class ChatAttachmentUploader {
	private uploadFile: ReturnType<typeof useUploadFile>;
	private client: ConvexClient;
	constructor() {
		this.client = useConvexClient();
		this.uploadFile = useUploadFile(api.chatAttachments);

		this.upload = this.upload.bind(this);
		this.uploadMany = this.uploadMany.bind(this);
		this.deleteAttachment = this.deleteAttachment.bind(this);
	}

	async deleteAttachment(key: string) {
		await this.client.mutation(api.chatAttachments.deleteObject, { key });
	}

	async upload(file: File): Promise<UploadedAttachment> {
		const mediaType =
			file.type || guessMediaTypeFromFileName(file.name) || 'application/octet-stream';
		const dimensionsPromise = isImageAttachmentMediaType(mediaType)
			? readImageDimensions(file)
			: Promise.resolve(null);
		const [key, dimensions] = await Promise.all([this.uploadFile(file), dimensionsPromise]);
		const url = await this.client.query(api.chatAttachments.getFileUrl, { key });
		return {
			url,
			key,
			mediaType,
			...(dimensions ? { width: dimensions.width, height: dimensions.height } : {})
		};
	}

	async uploadMany(files: File[]) {
		return await Promise.all(files.map(async (file) => await this.upload(file)));
	}
}
