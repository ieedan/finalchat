import type { Brand } from '$lib/utils/types';

export type ModelId = Brand<string, 'ModelId'>;

export type Model = {
	id: ModelId;
	name: string;
	description?: string;
};
