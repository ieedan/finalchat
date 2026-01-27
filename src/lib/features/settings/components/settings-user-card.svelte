<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { useChatLayout } from '$lib/features/chat/chat.svelte';
	import { useSettingsSetting } from '../settings.svelte';

	const chatLayoutState = useChatLayout();

	const user = chatLayoutState.user;

	const settingState = useSettingsSetting({
		id: 'user-card',
		title: 'User Card',
		description: 'Manage your account and logout'
	});
</script>

<div
	class="flex items-center justify-between bg-card w-full border border-border rounded-lg p-4"
	style={settingState.style}
>
	<div class="flex flex-row gap-2 items-center">
		<Avatar.Root class="size-12">
			<Avatar.Image src={user?.profilePictureUrl} />
			<Avatar.Fallback>
				{user?.firstName?.charAt(0)}
			</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex flex-col gap-0.5 text-start">
			<span class="">{user?.firstName} {user?.lastName}</span>
			<span class="text-sm text-muted-foreground">{user?.email}</span>
		</div>
	</div>
	<div>
		<Button href="/auth/signout" variant="destructive-outline" size="sm">Logout</Button>
	</div>
</div>
