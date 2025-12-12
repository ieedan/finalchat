import type { UserIdentity } from 'convex/server';
import { urlAlphabet, customAlphabet } from 'nanoid';

const nanoid = customAlphabet(urlAlphabet, 12);

/** UserId.nanoid() */
export type UploadKey = `${string}.${string}`;

export function parseUploadKey(uploadKey: UploadKey): {
	userId: string;
	key: string;
} {
	const [userId, key] = uploadKey.split('.');
	return {
		userId,
		key
	};
}

export function createKey(user: string | UserIdentity): UploadKey {
	if (typeof user === 'string') {
		return `${user}.${nanoid()}`;
	}
	return `${user.subject}.${nanoid()}`;
}
