# Users and Organizations

## Users

The [User object](/docs/reference/authkit/user) represents an identity that has access or owns artifacts in your application. A User object may not uniquely identify an individual person, since a person may present themselves as having multiple identities in the same system.

What uniquely identifies a user is their **email address**, since having access to that email inbox ultimately gives access to all accounts based on that address.

### Authentication methods

There may be multiple authentication methods on a single user object, such as [Email + Password](/docs/authkit/email-password) or [OAuth](/docs/authkit/social-login). A user can sign in with any of the authentication methods associated with them, as long as you have enabled those authentication methods in the WorkOS Dashboard.

<UserManagementDiagrams.AuthenticationMethods />

### Identity linking

Because a user is uniquely identified by their email address, you won’t have users with duplicate email addresses. WorkOS handles [identity linking](/docs/authkit/identity-linking) automatically.

### Email verification

All users will go through an initial [email verification process](/docs/authkit/email-verification) by default.

This applies to all authentication methods, including OAuth and SSO. This unifying interface simplifies how your application considers the authenticity of your users.

### Domain verification

If a user’s email domain matches a verified organization domain when signing in with SSO, they will [automatically be considered verified](/docs/authkit/domain-verification) and will not need to go through the email verification flow.

---

## Organizations

Organizations represent both a collection of users that your customer’s IT admin has control over and a workspace within which members collaborate. Organizations are a first-class concept in WorkOS and support a suite of features around organizational management. There is no limit to the number of organizations you can create in WorkOS.

### Organization memberships

An organization contains users as members. Organization membership allows you to model organizations as "workspaces" and user’s access to them with memberships.

WorkOS organization memberships are designed to be flexible, and support any B2B app model. For example:

<UserManagementDiagrams.UserToOrganizationRelationships />

- **Multiple Workspaces:** A self-serve productivity app, like Figma, where each user can be in any number of organizations, can create their own workspace and join any number of other workspaces.
- **Single Workspace:** An app that has no collaboration outside a customer’s company, like an employee survey tool, where each user is in exactly one organization.

While these are two distinct models, your choice may depend on your go-to-market strategy, which may change over time. **WorkOS AuthKit supports both**.

### Organization access

It’s common for users to create resources in B2B applications. You can use the organization as a container for these resources, so that access is dependent on a user’s access to the organization.

This means when a user leaves an organization and is no longer a member, the data remains with the organization and not the user. Organizations provide the level of data ownership that B2B applications structure around.

While organization membership conveys the most basic form of access, you can attach more granular role information per member within your own application’s database.

### Organization roles

In addition to the [environment-level roles](/docs/authkit/roles-and-permissions/configure-roles-and-permissions), organizations can define their own custom roles, which are assignable only within the context of the organization. Refer to the [organization roles documentation](/docs/authkit/roles-and-permissions/organization-roles) for more details.

### Membership management

If your application uses a soft-delete model, you can utilize the extended organization membership lifecycle. Organization memberships have three possible statuses:

- `pending`, when a user is invited to an organization
- `active`, when a user is added as an organization member or accepts an invitation
- `inactive`, when an organization membership is deactivated

For soft-delete use cases, we also provide deactivation and reactivation APIs:

- [Deactivating an organization membership](/docs/reference/authkit/organization-membership/deactivate) sets its status to `inactive` and revokes all active [sessions](/docs/authkit/sessions). Note `pending` memberships cannot be deactivated and should be deleted using the [deleting membership API](/docs/reference/authkit/organization-membership/delete) instead.
- [Reactivating an organization membership](/docs/reference/authkit/organization-membership/reactivate) sets its status to `active` and retains the role attached to the organization membership prior to deactivation. This role can be updated using the [update organization membership API](/docs/reference/authkit/organization-membership/update). Note `pending` memberships cannot be reactivated. For this the user should go through the [invitation acceptance flow](/docs/authkit/invitations) instead. If invitations are not needed, the organization membership can be [created as active directly](/docs/reference/authkit/organization-membership/create).

If your application uses a hard-delete model, you may use organization memberships without deactivation/reactivation by [deleting memberships](/docs/reference/authkit/organization-membership/delete) for users who should no longer have access to an organization.

### When to use deletion vs. deactivation

Hard deletion is preferred if the app has no need to "remember" the membership. For example, when members operate solely on customer data and have no data of their own. When a member of the organization is gone, there's no need to keep around their membership data. An app in this case may even want to entirely [delete the User](/docs/reference/authkit/user/delete) once the membership is deleted.

Deactivation may be preferred in cases where a member retains some data after leaving the organization, for example: messages, documents, or other data which reference that member. It also allows for building a user interface to list former members, perhaps with the option to reactivate them.

### Automated memberships

Beyond manually adding or removing users to and from organizations as members, users can be automatically [Just-in-Time (JIT) provisioned](/docs/authkit/jit-provisioning) into an organization if their email address matches one of the organization's [verified domains](/docs/authkit/domain-verification). This allows customers to quickly onboard teammates.

Users can also [invite individuals to organizations](/docs/authkit/invitations), regardless of their email domain. This is handy for contractors within a company, or a collection of people without a shared domain.

### Creating organizations for new users

In some applications, all activity should happen within the context of an organization. This pattern is common in B2B applications where:

- All features and data are scoped to an organization
- Users need to be associated with an organization to use the application

For these applications, when new users don't already belong to an organization via [Just-in-Time provisioning](/docs/authkit/jit-provisioning) or an [invitation](/docs/authkit/invitations), you'll want to create an organization for them.

To ensure all users have at least one organization:

1. **Check the access token**: When AuthKit redirects a user to your application after sign up or sign in, check whether the [access token](/docs/authkit/sessions/integrating-sessions/access-token) contains an `org_id`
2. **Present organization creation form**: If no organization is present, show the user a form with a name field to create a new organization
3. **Create the organization**: On form submission, use the [create organization API](/docs/reference/organization/create) to create the organization
4. **Create organization membership**: Use the [create organization membership API](/docs/reference/authkit/organization-membership/create) to add the user as a member of the new organization
5. **Refresh the token**: Call the [authenticate with refresh token API](/docs/reference/authkit/authentication/refresh-token) with the new organization ID to receive a new access token that includes the organization
