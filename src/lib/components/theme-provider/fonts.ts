import type { Font } from './types';

export const FONTS_SANS: Font[] = [
	{
		name: 'IBM Plex Sans',
		family: "'IBM Plex Sans Variable', sans-serif",
		default: true
	},
	{
		name: 'Dyslexic friendly',
		family: "'Atkinson Hyperlegible Mono Variable', sans-serif",
		default: false
	},
	{
		name: 'System',
		family:
			"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
		default: false
	}
];

export const FONTS_MONO: Font[] = [
	{
		name: 'Geist Mono',
		family: "'Geist Mono', monospace",
		default: true
	},
	{
		name: 'Dyslexic friendly',
		family: "'Atkinson Hyperlegible Next Variable', sans-serif",
		default: false
	},
	{
		name: 'System',
		family:
			"ui-monospace, 'SFMono-Regular', 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
		default: false
	}
];
