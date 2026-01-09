<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { Button } from '$lib/components/ui/button';
	import { Github } from '$lib/components/logos';
</script>

<Item.Root variant="outline" class="bg-card">
	<Item.Content>
		<Item.Title>Bugs</Item.Title>
		<Item.Description>Report any bugs by creating an issue on GitHub.</Item.Description>
	</Item.Content>
	<Item.Actions>
		<Button
			href="https://github.com/ieedan/finalchat/issues"
			variant="outline"
			target="_blank"
			rel="noopener noreferrer"
		>
			<Github />
			ieedan/finalchat
		</Button>
	</Item.Actions>
</Item.Root>
