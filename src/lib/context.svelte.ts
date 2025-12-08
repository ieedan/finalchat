import { Context } from 'runed';
import type { WritableBox } from 'svelte-toolbelt';
import type { ModelId } from './features/chat/types';

export const AccessTokenCtx = new Context<WritableBox<string | undefined>>('access-token-context');

export const ModelIdCtx = new Context<WritableBox<ModelId | null>>('model-id-context');
