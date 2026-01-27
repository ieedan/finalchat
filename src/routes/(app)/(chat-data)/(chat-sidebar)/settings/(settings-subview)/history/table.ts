import type { Doc } from '$lib/convex/_generated/dataModel';
import { renderComponent } from '$lib/components/ui/data-table';
import { createTable } from '$lib/components/ui/data-table/create-table.svelte';
import DataTableCheckbox from '$lib/components/ui/data-table/data-table-checkbox.svelte';
import type { ReadableBox } from 'svelte-toolbelt';

export function createChatsTable(data: ReadableBox<Doc<'chats'>[]>) {
	return createTable({
		data,
		pageSize: Number.MAX_SAFE_INTEGER,
		columns: [
			{
				id: 'select',
				header: ({ table }) =>
					renderComponent(DataTableCheckbox, {
						checked: table.getIsAllPageRowsSelected(),
						indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
						onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
						'aria-label': 'Select all'
					}),
				cell: ({ row }) =>
					renderComponent(DataTableCheckbox, {
						checked: row.getIsSelected(),
						onCheckedChange: (value) => row.toggleSelected(!!value),
						'aria-label': 'Select row'
					}),
				enableSorting: false,
				enableHiding: false
			},
			{
				header: 'Title',
				accessorKey: 'title'
			},
			{
				header: 'Created On',
				accessorFn: (row) => new Date(row._creationTime).toLocaleDateString()
			}
		]
	});
}
