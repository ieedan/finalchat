import { Context } from 'runed';
import type { WritableBox } from 'svelte-toolbelt';

export const AccessTokenCtx = new Context<WritableBox<string | undefined>>('access-token-context');
