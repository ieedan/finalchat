/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as apiKeys from '../apiKeys.js';
import type * as chat from '../chat.js';
import type * as chatAttachments from '../chatAttachments.js';
import type * as functions from '../functions.js';
import type * as http from '../http.js';
import type * as messages from '../messages.js';
import type * as userSettings from '../userSettings.js';

import type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';

declare const fullApi: ApiFromModules<{
	apiKeys: typeof apiKeys;
	chat: typeof chat;
	chatAttachments: typeof chatAttachments;
	functions: typeof functions;
	http: typeof http;
	messages: typeof messages;
	userSettings: typeof userSettings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, 'public'>>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, 'internal'>>;

export declare const components: {
	persistentTextStreaming: {
		lib: {
			addChunk: FunctionReference<
				'mutation',
				'internal',
				{ final: boolean; streamId: string; text: string },
				any
			>;
			createStream: FunctionReference<'mutation', 'internal', {}, any>;
			getStreamStatus: FunctionReference<
				'query',
				'internal',
				{ streamId: string },
				'pending' | 'streaming' | 'done' | 'error' | 'timeout'
			>;
			getStreamText: FunctionReference<
				'query',
				'internal',
				{ streamId: string },
				{
					status: 'pending' | 'streaming' | 'done' | 'error' | 'timeout';
					text: string;
				}
			>;
			setStreamStatus: FunctionReference<
				'mutation',
				'internal',
				{
					status: 'pending' | 'streaming' | 'done' | 'error' | 'timeout';
					streamId: string;
				},
				any
			>;
		};
	};
	r2: {
		lib: {
			deleteMetadata: FunctionReference<
				'mutation',
				'internal',
				{ bucket: string; key: string },
				null
			>;
			deleteObject: FunctionReference<
				'mutation',
				'internal',
				{
					accessKeyId: string;
					bucket: string;
					endpoint: string;
					key: string;
					secretAccessKey: string;
				},
				null
			>;
			deleteR2Object: FunctionReference<
				'action',
				'internal',
				{
					accessKeyId: string;
					bucket: string;
					endpoint: string;
					key: string;
					secretAccessKey: string;
				},
				null
			>;
			getMetadata: FunctionReference<
				'query',
				'internal',
				{
					accessKeyId: string;
					bucket: string;
					endpoint: string;
					key: string;
					secretAccessKey: string;
				},
				{
					bucket: string;
					bucketLink: string;
					contentType?: string;
					key: string;
					lastModified: string;
					link: string;
					sha256?: string;
					size?: number;
					url: string;
				} | null
			>;
			listMetadata: FunctionReference<
				'query',
				'internal',
				{
					accessKeyId: string;
					bucket: string;
					cursor?: string;
					endpoint: string;
					limit?: number;
					secretAccessKey: string;
				},
				{
					continueCursor: string;
					isDone: boolean;
					page: Array<{
						bucket: string;
						bucketLink: string;
						contentType?: string;
						key: string;
						lastModified: string;
						link: string;
						sha256?: string;
						size?: number;
						url: string;
					}>;
					pageStatus?: null | 'SplitRecommended' | 'SplitRequired';
					splitCursor?: null | string;
				}
			>;
			store: FunctionReference<
				'action',
				'internal',
				{
					accessKeyId: string;
					bucket: string;
					endpoint: string;
					secretAccessKey: string;
					url: string;
				},
				any
			>;
			syncMetadata: FunctionReference<
				'action',
				'internal',
				{
					accessKeyId: string;
					bucket: string;
					endpoint: string;
					key: string;
					onComplete?: string;
					secretAccessKey: string;
				},
				null
			>;
			upsertMetadata: FunctionReference<
				'mutation',
				'internal',
				{
					bucket: string;
					contentType?: string;
					key: string;
					lastModified: string;
					link: string;
					sha256?: string;
					size?: number;
				},
				{ isNew: boolean }
			>;
		};
	};
};
