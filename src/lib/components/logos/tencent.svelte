<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, ...rest }: HTMLAttributes<SVGSVGElement> = $props();
</script>

<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class={cn('', className)} {...rest}
	><title>Tencent</title><path
		d="M9.976 1L24 9.8l-10.587.015L10.723 23H5.489L8.18 9.8H3.244L1 5.4h8.077L9.976 1z"
		fill="#0052D9"
		fill-rule="evenodd"
	></path></svg
>
