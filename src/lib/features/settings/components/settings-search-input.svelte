<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import { RiSearchLine as SearchIcon } from 'remixicon-svelte';
	import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
	import * as Kbd from '$lib/components/ui/kbd';
	import { useSettingsSearchInput } from '../settings.svelte';
	import { box } from 'svelte-toolbelt';

	type Props = {
		value?: string;
	};

	let { value = $bindable('') }: Props = $props();

	useSettingsSearchInput({
		value: box.with(
			() => value,
			(v) => (value = v)
		)
	});
</script>

<InputGroup.Root class="bg-card">
	<InputGroup.Input placeholder="Search..." bind:value />
	<InputGroup.Addon>
		<SearchIcon />
	</InputGroup.Addon>
	<InputGroup.Addon align="inline-end">
		<Kbd.Group>
			<Kbd.Root>
				{cmdOrCtrl}
			</Kbd.Root>
			<Kbd.Root>K</Kbd.Root>
		</Kbd.Group>
	</InputGroup.Addon>
</InputGroup.Root>
