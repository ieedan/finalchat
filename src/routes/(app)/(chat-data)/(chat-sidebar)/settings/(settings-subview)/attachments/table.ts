import type { Doc } from '$lib/convex/_generated/dataModel';
import { renderComponent } from '$lib/components/ui/data-table';
import { createTable } from '$lib/components/ui/data-table/create-table.svelte';
import DataTableCheckbox from '$lib/components/ui/data-table/data-table-checkbox.svelte';
import type { ReadableBox } from 'svelte-toolbelt';
import AttachmentPreview from './attachment-preview.svelte';
import AttachmentActions from './attachment-actions.svelte';

export type AttachmentWithUrl = Doc<'chatAttachments'> & { url: string };

export function createAttachmentsTable(data: ReadableBox<AttachmentWithUrl[]>) {
	return createTable({
		data,
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
				id: 'preview',
				header: 'Preview',
				cell: ({ row }) =>
					renderComponent(AttachmentPreview, {
						url: row.original.url,
						mediaType: row.original.mediaType
					})
			},
			{
				header: 'Type',
				accessorKey: 'mediaType'
			},
			{
				header: 'Uploaded On',
				accessorFn: (row) => new Date(row._creationTime).toLocaleDateString()
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) =>
					renderComponent(AttachmentActions, {
						attachmentKey: row.original.key,
						mediaType: row.original.mediaType
					})
			}
		]
	});
}
