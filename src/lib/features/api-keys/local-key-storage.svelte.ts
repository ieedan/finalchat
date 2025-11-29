import { PersistedState } from 'runed';

export function useLocalApiKey() {
	return new PersistedState<string | null>('api-key', null);
}
