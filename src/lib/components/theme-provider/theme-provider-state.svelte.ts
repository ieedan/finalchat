import { Context } from 'runed';
import type { Font } from './types';
import { FONTS_MONO, FONTS_SANS } from './fonts';

type ThemeProviderOptions = {
	defaultFontSans?: string | null;
	defaultFontMono?: string | null;
};

const SANS_FONT_COOKIE = 'theme-sans-font';
const MONO_FONT_COOKIE = 'theme-mono-font';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setCookie(name: string, value: string) {
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

class ThemeProviderState {
	#sansFont: Font | null = $state(null);
	#monoFont: Font | null = $state(null);

	constructor(readonly opts: ThemeProviderOptions) {
		// Initialize from server-provided defaults (from cookies read server-side)
		if (opts.defaultFontSans) {
			const font = FONTS_SANS.find((f) => f.name === opts.defaultFontSans);
			if (font) this.#sansFont = font;
		}

		if (opts.defaultFontMono) {
			const font = FONTS_MONO.find((f) => f.name === opts.defaultFontMono);
			if (font) this.#monoFont = font;
		}

		$effect(() => {
			document.documentElement.style.setProperty('--font-sans', this.sansFont.family);
		});
		$effect(() => {
			document.documentElement.style.setProperty('--font-mono', this.monoFont.family);
		});
	}

	selectSansFont(font: Font) {
		this.#sansFont = font;
		setCookie(SANS_FONT_COOKIE, font.name);
	}

	selectMonoFont(font: Font) {
		this.#monoFont = font;
		setCookie(MONO_FONT_COOKIE, font.name);
	}

	get sansFont() {
		const defaultSansFont = FONTS_SANS.find((font) => font.default) ?? FONTS_SANS[0];
		return this.#sansFont ?? defaultSansFont;
	}

	get monoFont() {
		const defaultMonoFont = FONTS_MONO.find((font) => font.default) ?? FONTS_MONO[0];
		return this.#monoFont ?? defaultMonoFont;
	}
}

const ThemeProviderCtx = new Context<ThemeProviderState>('theme-provider-state');

export function setupThemeProvider(opts: ThemeProviderOptions) {
	return ThemeProviderCtx.set(new ThemeProviderState(opts));
}

export function useThemeProvider() {
	return ThemeProviderCtx.get();
}
