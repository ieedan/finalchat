import { httpRouter } from 'convex/server';
import { streamMessage } from './messages';
import { httpAction } from './_generated/server';
import { downloadFile } from './chatAttachments';

const http = httpRouter();

http.route({
	path: '/messages/stream',
	method: 'POST',
	handler: streamMessage
});

http.route({
	path: '/messages/stream',
	method: 'OPTIONS',
	handler: httpAction(async (_, request) => {
		const headers = request.headers;
		if (
			headers.get('Origin') !== null &&
			headers.get('Access-Control-Request-Method') !== null &&
			headers.get('Access-Control-Request-Headers') !== null
		) {
			return new Response(null, {
				headers: new Headers({
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST',
					'Access-Control-Allow-Headers': 'Content-Type, Digest, Authorization',
					'Access-Control-Max-Age': '86400'
				})
			});
		} else {
			return new Response();
		}
	})
});

http.route({
	path: '/download-image',
	method: 'POST',
	handler: downloadFile
});

http.route({
	path: '/download-image',
	method: 'OPTIONS',
	handler: httpAction(async (_, request) => {
		const headers = request.headers;
		if (
			headers.get('Origin') !== null &&
			headers.get('Access-Control-Request-Method') !== null &&
			headers.get('Access-Control-Request-Headers') !== null
		) {
			return new Response(null, {
				headers: new Headers({
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST',
					'Access-Control-Allow-Headers': 'Content-Type, Digest, Authorization',
					'Access-Control-Max-Age': '86400'
				})
			});
		} else {
			return new Response();
		}
	})
});

export default http;
