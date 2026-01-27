<script lang="ts">
	import * as AccountSettings from '$lib/components/layout/account-settings';
	import * as Card from '$lib/components/ui/card';
	import { RiAttachment2 as PaperclipIcon, RiDeleteBinLine as DeleteIcon } from 'remixicon-svelte';
	import { Button } from '$lib/components/ui/button';
	import { createAttachmentsTable, type AttachmentWithUrl } from './table';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { api } from '$lib/convex/_generated/api';
	import { box } from 'svelte-toolbelt';
	import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { useConvexClient } from 'convex-svelte';
	import * as Table from '$lib/components/ui/table';
	import { FlexRender } from '$lib/components/ui/data-table';
	import { Checkbox } from '$lib/components/ui/checkbox';

	const attachmentsQuery = useCachedQuery(api.chatAttachments.getAll, {});

	const client = useConvexClient();

	const table = createAttachmentsTable(
		box.with(() => (attachmentsQuery.data as AttachmentWithUrl[]) ?? [])
	);

	function handleDelete(e: MouseEvent) {
		const rowIds = table
			.getSelectedRowModel()
			.rows.map((row: { original: AttachmentWithUrl }) => row.original._id);

		confirmDelete({
			title: `Are you sure you want to delete ${rowIds.length} ${
				rowIds.length === 1 ? 'attachment' : 'attachments'
			}?`,
			description: 'This action cannot be undone.',
			skipConfirmation: e.shiftKey,
			onConfirm: () => deleteAttachments(rowIds)
		});
	}

	async function deleteAttachments(rowIds: Id<'chatAttachments'>[]) {
		await client.mutation(api.chatAttachments.remove, {
			ids: rowIds
		});
		table.resetRowSelection();
	}
</script>

<AccountSettings.Page>
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex place-items-center gap-2">
				<PaperclipIcon class="size-4" />
				Attachments
			</Card.Title>
			<Card.Description>Manage your chat attachments.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-2">
			<div
				class="border-border rounded-sm border bg-background **:data-[slot='checkbox']:border-border!"
			>
				<div class="border-border flex justify-between border-b px-2 py-2">
					<div class="flex place-items-center gap-2">
						<Checkbox
							bind:checked={
								() => table.getIsAllPageRowsSelected(),
								(value) => table.toggleAllPageRowsSelected(value)
							}
							indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
						/>
						<span class="text-sm">Select all</span>
					</div>
					<Button
						onclick={handleDelete}
						variant="destructive"
						size="sm"
						disabled={table.getSelectedRowModel().rows.length === 0}
					>
						<DeleteIcon />
						Delete {table.getSelectedRowModel().rows.length}
						{table.getSelectedRowModel().rows.length === 1 ? 'Attachment' : 'Attachments'}
					</Button>
				</div>
				<div class="max-h-[400px] overflow-y-auto">
					<Table.Root>
						<Table.Body>
							{#each table.getRowModel().rows as row (row.id)}
								<Table.Row data-state={row.getIsSelected() && 'selected'}>
									{#each row.getVisibleCells() as cell (cell.id)}
										<Table.Cell>
											<FlexRender
												content={cell.column.columnDef.cell}
												context={cell.getContext()}
											/>
										</Table.Cell>
									{/each}
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={table.getAllColumns().length} class="h-24 text-center">
										No attachments found.
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</AccountSettings.Page>
