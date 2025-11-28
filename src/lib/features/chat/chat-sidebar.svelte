<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { sidebarMenuButtonVariants } from '$lib/components/ui/sidebar/sidebar-menu-button.svelte';
	import { ChatCtx } from './chat.svelte';
	import { CircleThemeSelector } from '$lib/components/ui/circle-theme-selector';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { goto } from '$app/navigation';

	const chatContext = ChatCtx.get();
</script>

<Sidebar.Root>
	<Sidebar.Header></Sidebar.Header>
	<Sidebar.Content></Sidebar.Content>
	<Sidebar.Footer>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={sidebarMenuButtonVariants({ size: 'lg' })}>
				<div class="flex items-center gap-2">
					<Avatar.Root>
						<Avatar.Image src={chatContext.user.profilePictureUrl} />
						<Avatar.Fallback>
							{chatContext.user.firstName?.charAt(0)}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex flex-col gap-0.5">
						<span class="text-sm font-medium">
							{chatContext.user.firstName}
							{chatContext.user.lastName}
						</span>
						<span class="text-xs text-muted-foreground">
							{chatContext.user.email}
						</span>
					</div>
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)" align="center" side="top">
				<DropdownMenu.Item
					onSelect={(e) => e.preventDefault()}
					class="flex items-center justify-between gap-2"
				>
					<span>Theme</span>
					<CircleThemeSelector size="sm" />
				</DropdownMenu.Item>
				<DropdownMenu.Item class="flex items-center justify-between gap-2">
					<span>Settings</span>
					<SettingsIcon />
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="flex items-center justify-between gap-2"
					onSelect={() => goto('/auth/signout')}
				>
					<span>Logout</span>
					<LogOutIcon />
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.Footer>
</Sidebar.Root>
