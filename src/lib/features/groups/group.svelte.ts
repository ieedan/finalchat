import { useCachedQuery } from '$lib/cache/cached-query.svelte';
import { api } from '$lib/convex/_generated/api';
import type { ConvexClient } from 'convex/browser';
import { useChatLayout, type ChatLayoutState } from '../chat/chat.svelte';
import { useConvexClient } from 'convex-svelte';
import { Context } from 'runed';
import { toast } from 'svelte-sonner';
import { createGroup, updateGroupApiKey } from './groups.remote';

class GroupSettingsState {
	groupQuery: ReturnType<typeof useCachedQuery<typeof api.groups.get>>;
	chatLayoutState: ChatLayoutState;
	client: ConvexClient;
	constructor() {
		this.client = useConvexClient();
		this.chatLayoutState = useChatLayout();

		// this fixes an issue where the group query would not update when the group id changes
		const groupId = $derived(this.chatLayoutState?.user?.membership?.workosGroupId);
		this.groupQuery = useCachedQuery(api.groups.get, {
			get groupId() {
				return groupId;
			}
		});

		this.leaveGroup = this.leaveGroup.bind(this);
	}

	get isAdmin() {
		return this.chatLayoutState.user?.membership?.role === 'admin';
	}

	get group() {
		return this.groupQuery.data;
	}

	async leaveGroup() {
		try {
			await this.client.action(api.groups.leaveGroup, {});
		} catch (error) {
			toast.error('Failed to leave group', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	async updateApiKey(apiKey: string) {
		try {
			await updateGroupApiKey({ apiKey: apiKey }).updates(this.chatLayoutState.apiKeysQuery);
		} catch (error) {
			toast.error('Failed to save API key', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	async createGroup(group: Parameters<typeof createGroup>[0]) {
		try {
			await createGroup(group).updates(this.chatLayoutState.apiKeysQuery);
		} catch (error) {
			toast.error('Failed to create group', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	async removeMember(workosUserId: string) {
		try {
			await this.client.action(api.groups.removeMemberFromGroup, { workosUserId });
		} catch (error) {
			toast.error('Failed to remove member from group', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	async inviteMember(email: string, role: 'admin' | 'member') {
		try {
			await this.client.action(api.groups.inviteMemberToGroup, { email, role });
		} catch (error) {
			toast.error('Failed to invite member to group', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
}

const GroupCtx = new Context<GroupSettingsState>('group-state');

export function setupGroupSettings() {
	return GroupCtx.set(new GroupSettingsState());
}

export function useGroupSettings() {
	return GroupCtx.get();
}
