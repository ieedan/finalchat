import type { Brand } from '../../utils/types';

export type ModelId = Brand<string, 'ModelId'>;

export type Model = {
	id: ModelId;
	name: string;
	description?: string;
};
