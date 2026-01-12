<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';

	let { children } = $props();

	const sidebar = useSidebar();
</script>

<div class="flex flex-col h-full">
	<header class="sticky top-0 border-b z-20 bg-background">
		<div class="px-3 py-2.5 w-full flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if sidebar.isMobile || !sidebar.open}
					<div class="size-9"></div>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<Button href="/auth/signout" variant="outline">Logout</Button>
			</div>
		</div>
	</header>

	<div class="flex-1 min-h-0 overflow-y-auto">
		<div class="flex flex-col place-items-center">
			<AccountSettings.Root class="w-full max-w-5xl">
				<AccountSettings.Sidebar class="lg:border-r-0 z-20 bg-background">
					<AccountSettings.SidebarGroup>
						<AccountSettings.SidebarButton href="/settings">Account</AccountSettings.SidebarButton>
						<AccountSettings.SidebarButton href="/settings/customization">
							Customization
						</AccountSettings.SidebarButton>
						<AccountSettings.SidebarButton href="/settings/history">
							History
						</AccountSettings.SidebarButton>
						<AccountSettings.SidebarButton href="/settings/attachments">
							Attachments
						</AccountSettings.SidebarButton>
						<AccountSettings.SidebarButton href="/settings/group">
							Group
						</AccountSettings.SidebarButton>
					</AccountSettings.SidebarGroup>
				</AccountSettings.Sidebar>
				<AccountSettings.Content>
					{@render children()}
				</AccountSettings.Content>
			</AccountSettings.Root>
		</div>
	</div>
</div>
