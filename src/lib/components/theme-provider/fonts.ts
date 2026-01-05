import type { FontPreset } from './types';

export const FONT_PRESETS: FontPreset[] = [
	{
		name: 'Default',
		sansFamily: "'IBM Plex Sans Variable', sans-serif",
		monoFamily: "'Geist Mono', monospace",
		default: true
	},
	{
		name: 'Dyslexic friendly',
		sansFamily: "'Atkinson Hyperlegible Next Variable', sans-serif",
		monoFamily: "'Atkinson Hyperlegible Mono Variable', monospace",
		default: false
	},
	{
		name: 'System',
		sansFamily:
			"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
		monoFamily:
			"ui-monospace, 'SFMono-Regular', 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
		default: false
	}
];
