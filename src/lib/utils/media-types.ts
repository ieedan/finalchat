export const imageMediaTypes: Record<string, string> = {
	// Common image formats
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/gif': '.gif',
	'image/webp': '.webp',
	'image/svg+xml': '.svg',
	'image/bmp': '.bmp',
	'image/tiff': '.tiff',
	'image/x-icon': '.ico',
	'image/vnd.microsoft.icon': '.ico',
	'image/avif': '.avif',
	'image/apng': '.apng',
	'image/heic': '.heic',
	'image/heif': '.heif',

	// Additional formats
	'image/jp2': '.jp2',
	'image/jpx': '.jpx',
	'image/jpm': '.jpm',
	'image/jxr': '.jxr',
	'image/x-png': '.png',
	'image/pjpeg': '.jpg',
	'image/x-tiff': '.tiff',
	'image/x-ms-bmp': '.bmp'
};

export function getImageFileExtension(
	mediaType: string
): (typeof imageMediaTypes)[keyof typeof imageMediaTypes] | null {
	const normalizedMediaType = mediaType.toLowerCase().trim();

	return imageMediaTypes[normalizedMediaType] ?? null;
}
