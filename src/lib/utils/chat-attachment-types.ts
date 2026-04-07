import { getAttachmentFileExtension } from './media-types';

/**
 * Chat attachments use AI SDK user content parts: {@link ImagePart} and {@link FilePart}.
 * Allowlist common types multimodal models accept; extend as providers add support.
 */
export const CHAT_ATTACHMENT_ACCEPT = [
	'image/*',
	'application/pdf',
	'text/plain',
	'text/markdown',
	'text/csv',
	'application/json',
	// Browsers often leave `File.type` empty; match by extension.
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.webp',
	'.svg',
	'.bmp',
	'.tif',
	'.tiff',
	'.heic',
	'.heif',
	'.avif',
	'.pdf',
	'.txt',
	'.md',
	'.csv',
	'.json'
].join(',');

const extensionToMediaType: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.bmp': 'image/bmp',
	'.tif': 'image/tiff',
	'.tiff': 'image/tiff',
	'.heic': 'image/heic',
	'.heif': 'image/heif',
	'.avif': 'image/avif',
	'.pdf': 'application/pdf',
	'.txt': 'text/plain',
	'.md': 'text/markdown',
	'.csv': 'text/csv',
	'.json': 'application/json'
};

export function guessMediaTypeFromFileName(fileName: string): string | null {
	const dot = fileName.lastIndexOf('.');
	if (dot === -1) return null;
	const ext = fileName.slice(dot).toLowerCase();
	return extensionToMediaType[ext] ?? null;
}

export function isImageAttachmentMediaType(mediaType: string): boolean {
	return mediaType.toLowerCase().trim().startsWith('image/');
}

export function attachmentTypeLabel(mediaType: string): string {
	const lower = mediaType.toLowerCase().trim();
	if (lower.startsWith('image/')) return 'Image';
	if (lower === 'application/pdf') return 'PDF';
	if (lower === 'text/plain') return 'Text';
	if (lower === 'text/markdown') return 'Markdown';
	if (lower === 'text/csv') return 'CSV';
	if (lower === 'application/json') return 'JSON';
	const sub = lower.split('/')[1];
	return sub ? sub.toUpperCase() : 'File';
}

/** When the original filename is unknown (e.g. legacy rows), show a sensible default. */
export function fallbackAttachmentDisplayName(mediaType: string): string {
	const ext = getAttachmentFileExtension(mediaType);
	return ext ? `attachment${ext}` : 'attachment';
}
