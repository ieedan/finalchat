/**
 * Server-side image dimension parsing from raw bytes.
 *
 * Reads only the header bytes for common raster formats (PNG/JPEG/GIF/WebP)
 * so we can backfill `width`/`height` on existing chatAttachments without
 * pulling in a native image library. SVG, AVIF, HEIC are intentionally not
 * handled — callers should treat a `null` result as "unknown dimensions".
 */

export type ImageDimensions = { width: number; height: number };

export function parseImageDimensions(
	bytes: Uint8Array,
	mediaType: string
): ImageDimensions | null {
	const mt = mediaType.toLowerCase().trim();
	try {
		if (mt === 'image/png') return parsePng(bytes);
		if (mt === 'image/jpeg' || mt === 'image/jpg') return parseJpeg(bytes);
		if (mt === 'image/gif') return parseGif(bytes);
		if (mt === 'image/webp') return parseWebp(bytes);
	} catch {
		return null;
	}
	return null;
}

function parsePng(bytes: Uint8Array): ImageDimensions | null {
	if (bytes.length < 24) return null;
	// PNG signature: 89 50 4E 47 0D 0A 1A 0A
	const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
	for (let i = 0; i < 8; i++) if (bytes[i] !== sig[i]) return null;
	const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	// IHDR chunk width/height are at offsets 16 and 20, big-endian.
	return { width: dv.getUint32(16, false), height: dv.getUint32(20, false) };
}

function parseJpeg(bytes: Uint8Array): ImageDimensions | null {
	if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
	const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let i = 2;
	while (i < bytes.length - 9) {
		// Segments start with 0xFF; skip any run of fill bytes.
		if (bytes[i] !== 0xff) return null;
		let marker = bytes[i + 1];
		i += 2;
		while (marker === 0xff && i < bytes.length) marker = bytes[i++];

		// Standalone markers with no payload.
		if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) continue;
		if (marker >= 0xd0 && marker <= 0xd7) continue;

		// Start-of-frame markers (SOF0..SOF15) carry the dimensions.
		// Exclude DHT (C4), JPG (C8), DAC (CC).
		const isSof =
			marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
		if (isSof) {
			if (i + 7 > bytes.length) return null;
			// Skip 2 bytes segment length, 1 byte precision.
			return { height: dv.getUint16(i + 3, false), width: dv.getUint16(i + 5, false) };
		}

		// Otherwise skip the segment payload.
		if (i + 2 > bytes.length) return null;
		const segLen = dv.getUint16(i, false);
		if (segLen < 2) return null;
		i += segLen;
	}
	return null;
}

function parseGif(bytes: Uint8Array): ImageDimensions | null {
	if (bytes.length < 10) return null;
	// "GIF87a" or "GIF89a"
	if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) return null;
	if (bytes[3] !== 0x38 || (bytes[4] !== 0x37 && bytes[4] !== 0x39) || bytes[5] !== 0x61) {
		return null;
	}
	const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
}

function parseWebp(bytes: Uint8Array): ImageDimensions | null {
	if (bytes.length < 30) return null;
	// RIFF....WEBP
	if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) return null;
	if (bytes[8] !== 0x57 || bytes[9] !== 0x45 || bytes[10] !== 0x42 || bytes[11] !== 0x50) {
		return null;
	}
	const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
	const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

	if (chunk === 'VP8 ') {
		// Lossy: 3-byte start code 9D 01 2A at offset 23, then LE width/height (14 bits each).
		if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
		return {
			width: dv.getUint16(26, true) & 0x3fff,
			height: dv.getUint16(28, true) & 0x3fff
		};
	}
	if (chunk === 'VP8L') {
		// Lossless: signature 0x2F at offset 20, then 14 bits width-1 / 14 bits height-1.
		if (bytes[20] !== 0x2f) return null;
		const b0 = bytes[21];
		const b1 = bytes[22];
		const b2 = bytes[23];
		const b3 = bytes[24];
		return {
			width: 1 + (((b1 & 0x3f) << 8) | b0),
			height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
		};
	}
	if (chunk === 'VP8X') {
		// Extended: canvas width-1 at offset 24 (3 bytes LE), height-1 at offset 27.
		const w = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16);
		const h = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16);
		return { width: w + 1, height: h + 1 };
	}
	return null;
}
