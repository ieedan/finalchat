<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { MetaTags } from '$lib/components/meta-tags';

	let { children } = $props();

	const sidebar = useSidebar();
</script>

<MetaTags title="Settings" titleTemplate="%s ~ Settings ~ Finalchat" />

<header class="sticky top-0 border-b">
	<div class="px-3 py-2.5 w-full flex items-center justify-between z-20">
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
<AccountSettings.Root class="max-w-full">
	<AccountSettings.Sidebar>
		<AccountSettings.SidebarGroup>
			<AccountSettings.SidebarButton href="/settings">Account</AccountSettings.SidebarButton>
			<AccountSettings.SidebarButton href="/settings/agents">Agents</AccountSettings.SidebarButton>
			<AccountSettings.SidebarButton href="/settings/customization">
				Customization
			</AccountSettings.SidebarButton>
			<AccountSettings.SidebarButton href="/settings/history">
				History
			</AccountSettings.SidebarButton>
			<AccountSettings.SidebarButton href="/settings/attachments">
				Attachments
			</AccountSettings.SidebarButton>
		</AccountSettings.SidebarGroup>
	</AccountSettings.Sidebar>
	<AccountSettings.Content>
		{@render children()}
	</AccountSettings.Content>
</AccountSettings.Root>
