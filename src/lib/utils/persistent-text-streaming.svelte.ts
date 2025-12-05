import type { Id } from '$lib/convex/_generated/dataModel';
import type { StreamBody, StreamId } from '@convex-dev/persistent-text-streaming';
import { useQuery } from 'convex-svelte';
import type { FunctionReference } from 'convex/server';
import { onMount } from 'svelte';

export type StreamStatus = 'pending' | 'streaming' | 'done' | 'error';

export function useStream(
	getPersistentBody: FunctionReference<'query', 'public', { streamId: string }, StreamBody>,
	streamUrl: URL,
	{
		streamId,
		chatId,
		authToken,
		apiKey,
		headers
	}: {
		streamId: StreamId | undefined;
		chatId: Id<'chat'>;
		// If provided, this will be passed as the Authorization header.
		authToken?: string | null;
		apiKey: string | null;
		// If provided, these will be passed as additional headers.
		headers?: Record<string, string>;
	}
) {
	let streamEnded = $state<boolean | null>(null);
	let streamBody = $state<string>('');
	let streamStarted = $state(false);

	const usePersistence = $derived.by(() => {
		if (!streamEnded) return true;
		return false;
	});

	const persistentBody = useQuery(
		getPersistentBody,
		usePersistence && streamId ? { streamId } : 'skip'
	);

	onMount(() => {
		if (streamId && !streamStarted) {
			void (async () => {
				const success = await startStreaming(
					streamUrl,
					{ streamId, chatId, apiKey },
					(text) => {
						streamBody += text;
					},
					{
						...headers,
						...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
					}
				);
				streamEnded = success;
			})();

			return () => {
				streamStarted = true;
			};
		}
	});

	const body = $derived.by(() => {
		if (persistentBody) {
			if (persistentBody.data) {
				return {
					status: persistentBody.data.status,
					text: persistentBody.data.text
				};
			}

			return {
				status: 'pending',
				text: ''
			};
		}
		let status: StreamStatus;
		if (streamEnded === null) {
			status = streamBody.length > 0 ? 'streaming' : 'pending';
		} else {
			status = streamEnded ? 'done' : 'error';
		}
		return {
			text: streamBody,
			status: status as StreamStatus
		};
	});

	return {
		get body() {
			return body;
		}
	};
}

/**
 * Internal helper for starting a stream.
 *
 * @param url - The URL of the http action that will kick off the stream
 * generation and stream the result back to the client using the component's
 * `stream` method.
 * @param streamId - The ID of the stream.
 * @param onUpdate - A function that updates the stream body.
 * @returns A promise that resolves to a boolean indicating whether the stream
 * was started successfully. It can fail if the http action is not found, or
 * CORS fails, or an exception is raised, or the stream is already running
 * or finished, etc.
 */
async function startStreaming(
	url: URL,
	body: {
		streamId: StreamId;
		chatId: Id<'chat'>;
		apiKey: string | null;
	},
	onUpdate: (text: string) => void,
	headers: Record<string, string>
) {
	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json', ...headers }
	});
	// Adapted from https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
	if (response.status === 205) {
		console.error('Stream already finished', response);
		return false;
	}
	if (!response.ok) {
		console.error('Failed to reach streaming endpoint', response);
		return false;
	}
	if (!response.body) {
		console.error('No body in response', response);
		return false;
	}
	const reader = response.body.getReader();
	while (true) {
		try {
			const { done, value } = await reader.read();
			if (done) {
				onUpdate(new TextDecoder().decode(value));
				return true;
			}
			onUpdate(new TextDecoder().decode(value));
		} catch (e) {
			console.error('Error reading stream', e);
			return false;
		}
	}
}
