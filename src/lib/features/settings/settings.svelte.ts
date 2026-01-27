import { Context, watch } from 'runed';
import type { ReadableBox, WritableBoxedValues } from 'svelte-toolbelt';
import fuzzysort from 'fuzzysort';

export type Setting = {
	id: string;
	title: string;
	description: string;
	visible?: ReadableBox<boolean>;
};

class SettingsLayoutState {
	searchQuery = $state('');
	updateSearchQuery = $state<(value: string) => void>();
	settings: Setting[] = $state([]);
	constructor() {}

	registerSetting(setting: SettingsLayoutSetting) {
		this.settings.push(setting.opts);
	}

	searchQueryIsEmpty = $derived(this.searchQuery.trim().length === 0);

	sortedSettings = $derived.by(() => {
		// for some reason svelte isn't automatically tracking this dependency
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		this.searchQuery;
		if (this.searchQueryIsEmpty) return this.settings;
		return fuzzysort
			.go(this.searchQuery, this.settings, {
				keys: ['id', 'title', 'description'],
				threshold: 0.5
			})
			.map((result) => result.obj)
			.filter((setting) => (setting.visible ? setting.visible.current : true));
	});
}

type SettingsLayoutSearchInputProps = WritableBoxedValues<{
	value: string;
}>;

class SettingsLayoutSearchInput {
	constructor(
		readonly opts: SettingsLayoutSearchInputProps,
		readonly rootState: SettingsLayoutState
	) {
		watch(
			() => this.opts.value.current,
			(value) => {
				this.rootState.searchQuery = value;
			}
		);

		this.rootState.updateSearchQuery = (value: string) => {
			this.opts.value.current = value;
		};
	}
}

class SettingsLayoutSetting {
	constructor(
		readonly opts: Setting,
		readonly rootState: SettingsLayoutState
	) {
		this.rootState.registerSetting(this);
	}

	style = $derived.by(() => {
		const rootStateSettingIndex = this.rootState.sortedSettings.findIndex(
			(setting) => setting.id === this.opts.id
		);
		if (rootStateSettingIndex === -1) return 'display: none;';

		return `order: ${rootStateSettingIndex};`;
	});
}

export const SettingsLayoutCtx = new Context<SettingsLayoutState>('settings-layout-state');

export function setupSettingsLayout() {
	return SettingsLayoutCtx.set(new SettingsLayoutState());
}

export function useSettingsSearchInput(props: SettingsLayoutSearchInputProps) {
	return new SettingsLayoutSearchInput(props, SettingsLayoutCtx.get());
}

export function useSettingsSetting(props: Setting) {
	return new SettingsLayoutSetting(props, SettingsLayoutCtx.get());
}
