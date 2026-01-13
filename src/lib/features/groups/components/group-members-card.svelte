<script lang="ts" module>
	import { z } from 'zod';

	const InviteMemberSchema = z.object({
		email: z.email(),
		role: z.enum(['admin', 'member'])
	});
</script>

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { EllipsisIcon, PlusIcon } from '@lucide/svelte';
	import * as Modal from '$lib/components/ui/modal';
	import { useGroupSettings } from '../group.svelte';
	import { cn } from '$lib/utils';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';

	const groupSettingsState = useGroupSettings();

	let inviteOpen = $state(false);

	const uid = $props.id();

	const form = superForm(defaults({ email: '', role: 'member' }, zod4(InviteMemberSchema)), {
		id: uid,
		validators: zod4(InviteMemberSchema),
		onUpdate: async ({ form }) => {
			if (!form.valid) return;

			await groupSettingsState.inviteMember(form.data.email, form.data.role);

			inviteOpen = false;
		},
		SPA: true
	});

	const { form: fd, enhance, submitting } = form;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Members</Card.Title>
		<Card.Description>Manage the group members.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="border border-border rounded-lg bg-background">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Member</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head>
							<div class="flex items-center justify-end">
								<Modal.Root bind:open={inviteOpen}>
									<Modal.Trigger
										class={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'h-7')}
									>
										<PlusIcon />
										Invite
									</Modal.Trigger>
									<Modal.Content>
										<form use:enhance method="POST" class="contents">
											<Modal.Header>
												<Modal.Title>Invite</Modal.Title>
												<Modal.Description>Invite a new member to the group.</Modal.Description>
											</Modal.Header>
											<Field.Group class="gap-2">
												<Field.Field>
													<Field.Label>Email</Field.Label>
													<Input bind:value={$fd.email} placeholder="Enter an email" />
												</Field.Field>
												<Field.Field>
													<Field.Label>Role</Field.Label>
													<Select.Root type="single" bind:value={$fd.role}>
														<Select.Trigger class="border border-border">
															{$fd.role.charAt(0).toUpperCase() + $fd.role.slice(1)}
														</Select.Trigger>
														<Select.Content align="start">
															<Select.Item value="admin">Admin</Select.Item>
															<Select.Item value="member">
																Member
																<span class="text-muted-foreground"> (default) </span>
															</Select.Item>
														</Select.Content>
													</Select.Root>
												</Field.Field>
											</Field.Group>
											<Modal.Footer class="flex justify-end">
												<Button type="submit" loading={$submitting}>Invite</Button>
											</Modal.Footer>
										</form>
									</Modal.Content>
								</Modal.Root>
							</div>
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each groupSettingsState.group?.members as member (member.workosUserId)}
						<Table.Row>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<Avatar.Root class="size-7">
										<Avatar.Image src={member.profilePictureUrl} />
										<Avatar.Fallback>
											{member.firstName?.charAt(0)}
										</Avatar.Fallback>
									</Avatar.Root>
									<div class="flex flex-col">
										<p class="font-medium text-xs">{member.firstName} {member.lastName}</p>
										<p class="text-xs text-muted-foreground">{member.email}</p>
									</div>
								</div>
							</Table.Cell>
							<Table.Cell>
								{member.role.charAt(0).toUpperCase() + member.role.slice(1)}
							</Table.Cell>
							<Table.Cell>
								<div class="flex justify-end">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger
											class={buttonVariants({ variant: 'ghost', size: 'icon' })}
										>
											<EllipsisIcon />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end" side="bottom">
											<DropdownMenu.Item
												variant="destructive"
												disabled={member.workosUserId ===
													groupSettingsState.chatLayoutState.user?.workosUserId ||
													!groupSettingsState.isAdmin}
												onclick={() => groupSettingsState.removeMember(member.workosUserId)}
											>
												Remove from group
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</Card.Content>
</Card.Root>
