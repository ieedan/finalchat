import { api } from '$lib/convex/_generated/api';
import { useUploadFile } from '@convex-dev/r2/svelte';
import { useConvexClient } from 'convex-svelte';
import type { ConvexClient } from 'convex/browser';

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

	async upload(file: File): Promise<{ url: string; key: string; mediaType: string }> {
		const key = await this.uploadFile(file);
		const url = await this.client.query(api.chatAttachments.getFileUrl, { key });
		return { url, key, mediaType: file.type };
	}

	async uploadMany(files: File[]) {
		return await Promise.all(files.map(async (file) => await this.upload(file)));
	}
}
