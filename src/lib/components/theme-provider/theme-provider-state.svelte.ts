import { Context } from 'runed';
import type { FontPreset } from './types';
import { FONT_PRESETS } from './fonts';

type ThemeProviderOptions = {
	defaultFontPreset?: string | null;
};

const FONT_PRESET_COOKIE = 'theme-font-preset';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setCookie(name: string, value: string) {
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

class ThemeProviderState {
	#fontPreset: FontPreset | null = $state(null);

	constructor(readonly opts: ThemeProviderOptions) {
		// Initialize from server-provided default (from cookie read server-side)
		if (opts.defaultFontPreset) {
			const preset = FONT_PRESETS.find((p) => p.name === opts.defaultFontPreset);
			if (preset) this.#fontPreset = preset;
		}

		$effect(() => {
			document.documentElement.style.setProperty('--font-sans', this.fontPreset.sansFamily);
		});
		$effect(() => {
			document.documentElement.style.setProperty('--font-mono', this.fontPreset.monoFamily);
		});
	}

	selectFontPreset(preset: FontPreset) {
		this.#fontPreset = preset;
		setCookie(FONT_PRESET_COOKIE, preset.name);
	}

	get fontPreset() {
		const defaultPreset = FONT_PRESETS.find((p) => p.default) ?? FONT_PRESETS[0];
		return this.#fontPreset ?? defaultPreset;
	}
}

const ThemeProviderCtx = new Context<ThemeProviderState>('theme-provider-state');

export function setupThemeProvider(opts: ThemeProviderOptions) {
	return ThemeProviderCtx.set(new ThemeProviderState(opts));
}

export function useThemeProvider() {
	return ThemeProviderCtx.get();
}
