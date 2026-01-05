import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import type { RequestHandler } from './$types';
import OgImage from './og-image.svelte';

const ibmPlexSansRegular = new GoogleFont('IBM Plex Sans', {
	weight: 400,
	name: 'IBM Plex Sans'
});

export const GET: RequestHandler = async () => {
	const resolvedFontsPromise = resolveFonts([ibmPlexSansRegular]);

	return new ImageResponse(
		OgImage,
		{
			width: 1200,
			height: 630,
			fonts: await resolvedFontsPromise
		},
		{}
	);
};
