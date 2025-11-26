<script lang="ts">
	import { api } from '$lib/convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';

    const query = useQuery(api.chat.getAll);
</script>

{query.data?.length ?? 0} chats