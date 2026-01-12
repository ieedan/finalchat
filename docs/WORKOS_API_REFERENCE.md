# API reference

The WorkOS API enables adding Enterprise Ready features to your application. This REST API provides programmatic access to AuthKit (user management), Single Sign-On, Directory Sync, and Audit Log resources.

Sign in
to see code examples customized with your API keys and data.

# API Base URL

```javascript
https://api.workos.com
```

# Client libraries

WorkOS offers native SDKs in several popular programming languages. Choose one language below to see our API Reference in your application’s language.

Node.js

Ruby

Python

Go

PHP

Laravel

Java

.NET
Don't see an SDK you need? Contact us to request an SDK!

Install the SDK using the command below.

```bash
npm install @workos-inc/node
```

# Testing the API

You can test the API directly with cURL, or use the
Postman collection
for convenience.

Check out the guide about the WorkOS API Postman collection to learn more about it.

# API Authentication

WorkOS authenticates your API requests using your account’s API keys. API requests made without authentication or using an incorrect key will return a `401` error. Requests using a valid key but with insufficient permissions will return a `403` error. All API requests must be made over HTTPS. Any requests made over plain HTTP will fail.

## Using an API key

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');
You can view and manage your API keys in the
WorkOS Dashboard
.

```

## Secure your API Keys

API keys can perform any API request to WorkOS. They should be kept secure and private! Be sure to prevent API keys from being made publicly accessible, such as in client-side code, GitHub, unsecured S3 buckets, and so forth. API keys are prefixed with sk_.

## In Staging

Your Staging Environment comes with an API key already generated for you. Staging API keys may be viewed as often as they are needed and will appear inline throughout our documentation in code examples if you are logged in to your WorkOS account. API requests will be scoped to the provided key’s Environment.

## In Production

Once you unlock Production access you will need to generate an API Key for it. Production API keys may only be viewed once and will need to be saved in a secure location upon creation of them.

# Errors

WorkOS uses standard HTTP response codes to indicate the success or failure of your API requests.

`200`
Successful request.
`400`
The request was not acceptable. Check that the parameters were correct.
`401`
The API key used was invalid.
`403`
The API key used did not have the correct permissions.
`404`
The resource was not found.
`422`
Validation failed for the request. Check that the parameters were correct.
`429`
Too many requests. Refer to the Rate Limits section.
5xx
Indicates an error with WorkOS servers.

# Pagination

Many top-level resources have support for bulk fetches via list API methods. For instance, you can list connections, list directory users, and list directory groups. These list API methods share a common structure, taking at least these four parameters: limit, order, after, and before.

WorkOS utilizes pagination via the after and before parameters. Both parameters take an existing object ID value and return objects in either descending or ascending order by creation time.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

let list = await workos.sso.listConnections({ limit: 100, order: 'desc' });
let connections = list.data;
let after = list.listMetadata.after;

while (after) {
  list = await workos.sso.listConnections({
    limit: 100,
    after: after,
    order: 'desc',
  });
  connections = connections.concat(list.data);
  after = list.listMetadata.after;
}
```

### Parameters

- `before?`: `string`

- `after?`: `string`

- `limit?`: `number`

- `order?`: `"asc" | "desc"`

# Rate limits

WorkOS APIs are rate limited to ensure that they are fast for everyone. If you find yourself getting `429` errors, double check your integration to make sure you aren’t making unnecessary requests.

## General

| Name | Path | Limit |
|---|---|---|
| All requests | * | 6,000 requests per 60 seconds per IP address |

This rate limits applies to all environments, staging and production. Exceptions to the general rate limit are listed below.

# Single Sign-On

| Name | Path | Limit |
|---|---|---|
| Get Authorization URL | /sso/authorize | 1,000 requests per 60 seconds per connection |

# Directory Sync

| Name | Path | Limit |
|---|---|---|
| Directory Users | /directory_users | 4 requests per second per directory |

# Organizations

| Name | Path | Limit |
|---|---|---|
| Delete Organization | /organizations/* | 50 requests per 60 seconds per API key |

# AuthKit

Rate limiting for AuthKit APIs are enforced on a per environment basis.

| Name | Path | Limit |
|---|---|---|
| Reads | /user_management/* | 1,000 requests per 10 seconds |
| Writes | /user_management/* | 500 requests per 10 seconds |
| Authentication | /user_management/authenticate | 10 requests per 60 seconds per email or challenge ID |
| Magic Auth | /user_management/magic_auth/send | 3 requests per 60 seconds per email |
| Email verification | /user_management/:id/email_verification/send | 3 requests per 60 seconds per user |
| Password reset | /user_management/password_reset/send | 3 requests per 60 seconds per email |

## Hosted AuthKit

| Name | Limits |
|---|---|
| Reads | 1,000 requests per 10 seconds |
| Writes | 500 requests per 10 seconds |
| SSO sign-ins | 3 requests per 60 seconds per IP address |
| Email sign-ins | 10 requests per 60 seconds per email and IP address |
| Magic Auth sign-ins | 10 requests per 60 seconds per IP address and challenge ID |
| Magic Auth code requests | 3 requests per 60 seconds per IP address and email |

# Admin Portal

The Admin Portal is a standalone application where your users can configure and manage WorkOS resources such as Connections and Directories that are scoped to their Organization.

## Portal Link

A Portal Link is a temporary endpoint to initiate an Admin Portal session. It expires five minutes after issuance.

### Example Portal Link URL

```javascript
https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Generate a Portal Link

Generate a Portal Link scoped to an Organization.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { link } = await workos.portal.generateLink({
  organization: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  intent: 'sso',
});
```

### portal.generateLink()

### Parameters object

- `organization`: `string`

- `intent`: `string`

- `returnUrl?`: `string`

- `successUrl?`: `string`

### Returns object

- `link`: `string`

# Provider Icons

Icons for third-party providers are available through the WorkOS CDN. These icons cover identity providers, Directory Sync, and domain verification services used within the Admin Portal.

## List Provider Icons

Get a list of all of existing provider icons.

```bash
curl https://cdn.workos.com/provider-icons.json
Resources
The icons are also available as a Figma community file.
```

## Get a Provider Icon

To use an icon in your project, you can reference the CDN link directly. You can alternate between light and dark mode icons by changing the path in the URL or using CSS media queries.

### Example icon

```html
<picture>
  <source
    srcset="https://cdn.workos.com/provider-icons/dark/okta.svg"
    media="(prefers-color-scheme: dark)"
  />
  <img
    src="https://cdn.workos.com/provider-icons/light/okta.svg"
    alt="Okta icon"
  />
</picture>
You can change the icons to grayscale by adding the filter CSS property.

Grayscale style
img {
  filter: grayscale(100%);
}
```

# Audit Logs

Audit Logs are a collection of events that contain information relevant to notable actions taken by users in your application. Every event in the collection contains details regarding what kind of action was taken (action), who performed the action (actor), what resources were affected by the action (targets), and additional details of when and where the action took place.

## Create Event

Create an Audit Log Event.

This API supports idempotency which guarantees that performing the same operation multiple times will have the same result as if the operation were performed only once. This is handy in situations where you may need to retry a request due to a failure or prevent accidental duplicate requests from creating more than one resource.

To achieve idempotency, you can add Idempotency-Key request header to a Create Event request with a unique string as the value. Each subsequent request matching this unique string will return the same response. We suggest using
v4 UUIDs
for idempotency keys to avoid collisions.

Idempotency keys expire after 24 hours. The API will generate a new response if you submit a request with an expired key.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.auditLogs.createEvent(
  'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
  {
    action: 'user.signed_in',
    occurredAt: new Date(),
    version: 1,
    actor: {
      type: 'user',
      id: 'user_TF4C5938',
      name: 'Jon Smith',
      metadata: {
        role: 'admin',
      },
    },
    targets: [
      {
        type: 'user',
        id: 'user_98432YHF',
        name: 'Jon Smith',
      },
      {
        type: 'team',
        id: 'team_J8YASKA2',
        metadata: {
          owner: 'user_01GBTCQ2',
        },
      },
    ],
    context: {
      location: '1.1.1.1',
      userAgent: 'Chrome/104.0.0.0',
    },
    metadata: {
      extra: 'data',
    },
  },
  {
    idempotencyKey: '884793cd-bef4-46cf-8790-ed49257a09c6',
  },
);
```

### auditLogs.createEvent()

### Parameters

- `organizationId`: `string`

- `event`: `object`

- `action`: `string`

- `occurredAt`: `Date`

- `version?`: `number`

- `actor`: `AuditLogActor`

- `type`: `string`

- `id`: `string`

- `name?`: `string`

- `metadata?`: `object`

- `targets`: `AuditLogTarget[]`

- `type`: `string`

- `id`: `string`

- `name?`: `string`

- `metadata?`: `object`

- `context`: `object`

- `location`: `string`

- `userAgent?`: `string`

- `metadata?`: `object`

- `options?`: `object`

- `idempotencyKey`: `string`

## Audit Log Schema

An object representing an Audit Log Schema.

## Audit Log Schema

```javascript
const auditLogSchema = {
  object: 'audit_log_schema',
  version: 1,
  targets: [{ type: 'user', metadata: {} }],
  actor: { metadata: {} },
  metadata: {},
  createdAt: '2024-10-14T15:09:44.537Z',
};
```

#### `interface AuditLogSchema`

- `object`: `"audit_log_schema"`

- `version`: `number`

- `targets`: `array`

- `actor`: `object`

- `metadata`: `object`

## Create Schema

Creates a new Audit Log schema used to validate the payload of incoming Audit Log Events. If the action does not exist, it will also be created.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const schema = await workos.auditLogs.createSchema({
  action: 'user.viewed_invoice',
  actor: {
    metadata: {
      role: 'string',
    },
  },
  targets: [
    {
      type: 'user',
      metadata: {
        status: 'string',
      },
    },
  ],
  metadata: {
    invoice_id: 'string',
  },
});
```

### auditLogs.createSchema()

### Parameters

- `schema`: `object`

- `action`: `string`

- `actor?`: `object`

- `metadata`: `object`

- `targets`: `array`

- `type`: `string`

- `metadata?`: `object`

- `metadata?`: `object`

### Returns

AuditLogSchema

## List Schemas

Get a list of all schemas for the Audit Logs action identified by :name.

```bash
curl https://api.workos.com/audit_logs/actions/user.viewed_invoice/schemas \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

`/audit_logs/actions/:name/schemas`

### Parameters

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `array`

- `list_metadata`: `object`

## List Actions

Get a list of all Audit Log actions in the current environment.

```bash
curl https://api.workos.com/audit_logs/actions \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

`/audit_logs/actions`

### Parameters

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `array`

- `list_metadata`: `object`

## Audit Log Export

An object representing an Audit Log Export.

## Audit Log Export

```javascript
const auditLogExport = {
  object: 'audit_log_export',
  id: 'audit_log_export_01GBZK5MP7TD1YCFQHFR22180V',
  state: 'ready',
  url: 'https://exports.audit-logs.com/audit-log-exports/export.csv',
  created_at: '2022-09-02T17:14:57.094Z',
  updated_at: '2022-09-02T17:14:57.094Z',
};
```

#### `interface AuditLogExport`

- `object`: `"audit_log_export"`

- `id`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `state`: `"pending" | "ready" | "error"`

- `url?`: `string`

## Create Export

Create an Audit Log Export.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const auditLogExport = await workos.auditLogs.createExport({
  organizationId: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
  rangeStart: new Date('2022-07-02T18:09:06.996Z'),
  rangeEnd: new Date('2022-09-02T18:09:06.996Z'),
  actions: ['user.signed_in'],
  actors: ['Jon Smith'],
  targets: ['team'],
});
```

### auditLogs.createExport()

### Parameters object

- `organizationId`: `string`

- `rangeStart`: `Date`

- `rangeEnd`: `Date`

- `actions?`: `string[]`

- `actor_ids?`: `string[]`

- `actor_names?`: `string[]`

- `targets?`: `string[]`

### Returns

AuditLogExport

## Get Export

Get an Audit Log Export.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const auditLogExport = await workos.auditLogs.getExport(
  'audit_log_export_01GBZK5MP7TD1YCFQHFR22180V',
);
```

### auditLogs.getExport()

### Parameters

- `id`: `string`

### Returns

AuditLogExport
The URL will expire after 10 minutes. If the export is needed again at a later time, refetching the export will regenerate the URL.

## Get Retention

Get the configured event retention period for the given Organization.

```bash
curl https://api.workos.com/organizations/org_01EHZNVPK3SFK441A1RGBFSHRT/audit_logs_retention \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

`/organizations/:id/audit_logs_retention`

### Parameters

- `id`: `string`

### Returns object

- `retention_period_in_days`: `number`

## Set Retention

Set the event retention period for the given Organization.

```bash
curl --request PUT \
  --url https://api.workos.com/organizations/org_01EHZNVPK3SFK441A1RGBFSHRT/audit_logs_retention \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  -d '{ "retention_period_in_days": 30 }'
```

**PUT**

`/organizations/:id/audit_logs_retention`

### Parameters

- `id`: `string`

- `retention_period_in_days`: `number`

### Returns object

- `retention_period_in_days`: `number`

## Get Audit Log Configuration

The Audit Log Configuration endpoint provides a single view of an organization’s audit logging setup. It includes retention settings (how long audit logs are stored), the audit log state (active, inactive, or disabled), and – if configured – the audit log stream, which sends events to external destinations like Splunk, Datadog, S3, Google Cloud Storage, or a custom HTTPS endpoint.

The log_stream field is optional and only appears if the organization has a stream configured. If no stream is set up, the response includes only the audit log retention and state information.

```bash
curl https://api.workos.com/organizations/org_01EHZNVPK3SFK441A1RGBFSHRT/audit_log_configuration \
  --header "Authorization: Bearer sk_example_123456789"

```

**GET**

`/organizations/:id/audit_log_configuration`

### Parameters

- `id`: `string`

### Returns object

- `organization_id`: `string`

- `retention_period_in_days`: `number`

- `state`: `string`

- `log_stream?`: `object`

# AuthKit

AuthKit is a user management platform that provides a set of user authentication and organization security features designed to provide a fast, scalable integration while handling all of the user management complexity that comes with advanced B2B customer needs.

To automatically respond to AuthKit activities, like authentication and changes related to the users, use the corresponding events.

## User

Represents a user identity in your application. A user can sign up in your application directly with a method like password, or they can be JIT-provisioned through an organization’s SSO connection.

Users may belong to organizations as members.

See the events reference documentation for the user events.

## User

```javascript
const user = {
  object: 'user',
  id: 'user_01E4ZCR3C56J083X43JQXF3JK5',
  email: 'marcelina.davis@example.com',
  firstName: 'Marcelina',
  lastName: 'Davis',
  emailVerified: true,
  profilePictureUrl: 'https://workoscdn.com/images/v1/123abc',
  lastSignInAt: '2021-06-25T19:07:33.155Z',
  externalId: 'f1ffa2b2-c20b-4d39-be5c-212726e11222',
  metadata: {
    timezone: 'America/New_York',
  },
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
};
```

#### `interface User`

- `object`: `"user"`

- `id`: `string`

- `email`: `string`

- `firstName?`: `string`

- `lastName?`: `string`

- `emailVerified`: `boolean`

- `profilePictureUrl?`: `string`

- `lastSignInAt?`: `string`

- `externalId?`: `string`

- `metadata`: `object`

- `createdAt`: `string`

- `updatedAt`: `string`

## Get a user

Get the details of an existing user.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const user = await workos.userManagement.getUser(
  'user_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### userManagement.getUser()

### Parameters

- `id`: `string`

### Returns

## User

## Get a user by external ID

Get the details of an existing user by an external identifier.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const user = await workos.userManagement.getUserByExternalId(
  'f1ffa2b2-c20b-4d39-be5c-212726e11222',
);
```

### userManagement.getUserByExternalId()

### Parameters

- `externalId`: `string`

### Returns

## User

## List users

Get a list of all of your existing users matching the criteria specified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const users = await workos.userManagement.listUsers();

console.log(users.data);
```

### userManagement.listUsers()

### Parameters object

- `email?`: `string`

- `organizationId?`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `User[]`

- `listMetadata`: `object`

## Create a user

Create a new user in the current environment.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const user = await workos.userManagement.createUser({
  email: 'marcelina@example.com',
  password: 'i8uv6g34kd490s',
  firstName: 'Marcelina',
  lastName: 'Davis',
});
```

### userManagement.createUser()

### Parameters object

- `email`: `string`

- `password?`: `string`

- `passwordHash?`: `string`

- `passwordHashType?`: `string`

- `firstName?`: `string`

- `lastName?`: `string`

- `emailVerified?`: `boolean`

- `externalId?`: `string`

- `metadata?`: `object`

### Returns

## User

## Update a user

Updates properties of a user. The omitted properties will be left unchanged.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const user = await workos.userManagement.updateUser({
  userId: 'user_01EHQ7ZGZ2CZVQJGZ5ZJZ1ZJGZ',
  firstName: 'Marcelina',
  lastName: 'Davis',
  emailVerified: true,
  externalId: '2fe01467-f7ea-4dd2-8b79-c2b4f56d0191',
  metadata: {
    timezone: 'America/New_York',
  },
});
```

### userManagement.updateUser()

### Parameters

- `userId`: `string`

- `firstName?`: `string`

- `lastName?`: `string`

- `email?`: `string`

- `emailVerified?`: `boolean`

- `password?`: `string`

- `passwordHash?`: `string`

- `passwordHashType?`: `string`

- `externalId?`: `string`

- `metadata?`: `object`

### Returns

## User

## Delete a user

Permanently deletes a user in the current environment. It cannot be undone.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.userManagement.deleteUser('user_01F3GZ5ZGZBZVQGZVHJFVXZJGZ');
```

### userManagement.deleteUser()

### Parameters

- `id`: `string`

## Identities

Represents User identities obtained from external identity providers.

When a user authenticates using an external provider like Google OAuth, information from that provider will be made available as one of the user’s Identities. You can read more about the process in our identity linking guide.

Applications should check the type before making assumptions about the shape of the identity. Currently only OAuth identities are supported, but more types may be added in the future.

Identity
{
"idp_id": "4F42ABDE-1E44-4B66-824A-5F733C037A6D",
"type": "OAuth",
"provider": "MicrosoftOAuth"
}
identity

- `idp_id`: `string`

- `type`: `"OAuth"`

- `provider`: `enum`

## Get user identities

Get a list of identities associated with the user. A user can have multiple associated identities after going through identity linking. Currently only OAuth identities are supported. More provider types may be added in the future.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const identities = await workos.userManagement.getUserIdentities(
  'user_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### userManagement.getUserIdentities()

### Parameters

- `userId`: `String`

### Returns

- `identities`: `Identity[]`

## Authentication

Authenticate a user with a specified authentication method.

## Get an authorization URL

Generates an OAuth 2.0 authorization URL to authenticate a user with AuthKit or SSO.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const authorizationUrl = workos.userManagement.getAuthorizationUrl({
  connectionId: 'conn_01E4ZCR3C56J083X43JQXF3JK5',
  clientId: 'client_123456789',
  redirectUri: 'https://your-app.com/callback',
  state: 'dj1kUXc0dzlXZ1hjUQ==',
});
```

### userManagement.getAuthorizationUrl()

### Parameters object

- `redirectUri`: `string`

- `clientId`: `string`

- `codeChallenge?`: `string`

- `codeChallengeMethod?`: `"S256"`

- `connectionId?`: `string`

- `organizationId?`: `string`

- `provider?`: `"authkit" | "AppleOAuth" | "GitHubOAuth" | "GoogleOAuth" | "MicrosoftOAuth"`

- `state?`: `string`

- `loginHint?`: `string`

- `domainHint?`: `string`

screenHint?: "sign-up" | "sign-in"

- `providerScopes?`: `array`

### Returns

- `url`: `string`

If you are using AuthKit, set the provider parameter to "authkit", which will generate an authorization URL for your AuthKit domain. AuthKit will take care of detecting the user’s authentication method, such as identifying whether they use Email + Password or Single Sign-On,and direct them to the corresponding login flow.

Otherwise, to generate an authorization URL for a WorkOS SSO connection, you’ll have to specify the user’s connection, organization, or OAuth provider as a parameter. These connection selectors are mutually exclusive, and exactly one must be provided. The generated URL automatically directs the user to their identity provider. Once the user authenticates with their identity provider, WorkOS then issues a redirect to your redirect URI to complete the sign-in flow.

## Redirect URI

In the OAuth 2.0 protocol, a redirect URI is the location that the user is redirected to once they have successfully authenticated with their identity provider.

When redirecting the user, WorkOS will generate an authorization code and pass it to your redirect URI as a code query parameter, your app will use this code to authenticate the user. Additionally, WorkOS can pass a state parameter back to your application that you may use to encode arbitrary information to restore your application state between the redirects.

Redirect URI with query parameters
`https://your-app.com/callback?code=01E2RJ4C05B52KKZ8FSRDAP23J&state=dj1kUXc0dzlXZ1hjUQ==`
You can use state to encode parameters like originating URL and query parameters. This is useful in a flow where unauthenticated users are automatically redirected to a login page. After successful sign in, users will be routed to your redirect URI callback route. From there you can extract the originating URL from state and redirect the user to their intended destination.

You’ll need to configure the allowed redirect URIs for your application via the
Redirects
page in the dashboard. Without a valid redirect URI, your users will be unable to sign in. Make sure that the redirect URI you use as a parameter to get the authorization URL matches one of the redirect URIs you have configured in the dashboard.

Redirect URIs follow stricter requirements in production environments:

HTTPS protocol is required in production environments
HTTP and localhost are allowed in staging environments
The sole exception is the use of `http://127.0.0.1` in production environments to support native clients.

## Wildcards

WorkOS supports using wildcard characters in Redirect URIs. The * symbol can be used as a wildcard for subdomains; however, it must be used in accordance with the following rules in order to properly function.

The wildcard must be located in a subdomain within the hostname component. For example, `http://*.com` will not work.
The wildcard must be located in the subdomain which is furthest from the root domain. For example, `https://sub.*.example.com` will not work.
The URL must not contain more than one wildcard. For example, `https://*.*.example.com` will not work.
A wildcard character may be prefixed and/or suffixed with additional valid hostname characters. For example, `https://prefix-*-suffix.example.com` will work.
A URL with a valid wildcard will not match a URL more than one subdomain level in place of the wildcard. For example, `https://*.example.com` will not work with `https://sub1.sub2.example.com.`
In production environments, wildcards cannot be used with
public suffix domains
. For example, `https://*.ngrok-free.app` will not work.
The wildcard will match a sequence of letters (A through Z, and a through z ); digits (0 through 9), hyphens (-), and underscores (_). For example, `https://user:secret@foo.example.com` will not work with `https://*.example.com.`
A URL with a wildcard cannot be set as the default redirect URI.

## PKCE

The
Proof Key for Code Exchange
(PKCE) flow is an extension to the OAuth 2.0 Authorization Code flow. It enables public clients, like native apps or single-page apps, to perform the authorization code flow securely. If you are developing a client that makes API calls in public, you’ll need to use this flow.

In this flow, your client generates a code verifier which is a high-entropy cryptographic random string. A code challenge is derived by hashing the code verifier. Instead of using a client secret, provide the code challenge when getting the authorization URL and the code verifier when authenticating a User.

## Error codes

If there is an issue generating an authorization URL, the API will return the original redirect URI with error and error_description query parameters. If provided, the state value will also be included.

Redirect URI with an error code
`https://your-app.com/callback?error=organization_invalid&error_description=No%20connection%20associated%20with%20organization&state=123456789`
Possible error codes and the corresponding descriptions are listed below.

| Error code | Description |
|---|---|
| access_denied | The identity provider denied user access to the client application or the user denied an OAuth authorization request at the identity provider. |
| ambiguous_connection_selector | A connection could not be uniquely identified using the provided connection selector (e.g., organization). This can occur when there are multiple SSO connections under the same organization. If you need multiple SSO connections for an organization, use the connection parameter to identify which connection to use for SSO. |
| connection_invalid | There is no connection for the provided ID. |
| connection_strategy_invalid | The provider has multiple strategies associated per environment. |
| connection_unlinked | The connection associated with the request is unlinked. |
| invalid_connection_selector | A valid connection selector query parameter must be provided in order to correctly determine the proper connection to return an authorization URL for. Valid connection selectors are either connection, organization, or provider. |
| organization_invalid | There is no organization matching the provided ID. |
| oauth_failed | An OAuth authorization request failed for a user. |
| server_error | The SSO authentication failed for the user. More detailed errors and steps to resolve are available in the Sessions tab on the connection page in the WorkOS Dashboard. |

## Authenticate with code

Authenticates a user using AuthKit, OAuth or an organization’s SSO connection.

AuthKit handles all authentication methods, however it is conceptually similar to a social login experience. Like OAuth and SSO, AuthKit returns you a code that you can exchange for an authenticated user. See Integrating with AuthKit.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { user } = await workos.userManagement.authenticateWithCode({
  clientId: 'client_123456789',
  code: '01E2RJ4C05B52KKZ8FSRDAP23J',
  ipAddress: '192.0.2.1',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
});
```

### userManagement.authenticateWithCode()

### Parameters object

- `clientId`: `string`

- `code`: `string`

- `codeVerifier?`: `string`

- `invitationToken?`: `string`

- `ipAddress?`: `string`

- `userAgent?`: `string`

- `session?`: `object`

### Returns object

- `user`: `User`

- `organizationId?`: `string`

- `accessToken`: `string`

- `refreshToken`: `string`

- `authenticationMethod`: `"SSO" | "Password" | "AppleOAuth" | "GitHubOAuth" | "GoogleOAuth" | "MicrosoftOAuth" | "MagicAuth" | "Impersonation"`

- `impersonator?`: `object`

- `sealedSession?`: `string`

- `oauthTokens?`: `object`

## Authenticate a user with password

Authenticates a user with email and password.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { user } = await workos.userManagement.authenticateWithPassword({
  clientId: 'client_123456789',
  email: 'marcelina@example.com',
  password: 'i8uv6g34kd490s',
  ipAddress: '192.0.2.1',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
});
```

### userManagement.authenticateWithPassword()

### Parameters object

- `clientId`: `string`

- `email`: `string`

- `password`: `string`

- `invitationToken?`: `string`

- `ipAddress?`: `string`

- `userAgent?`: `string`

- `session?`: `object`

### Returns object

- `user`: `User`

- `organizationId?`: `string`

- `authenticationMethod`: `"Password"`

- `sealedSession?`: `string`

## Authenticate with Magic Auth

Authenticates a user by verifying the Magic Auth code sent to the user’s email.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { user } = await workos.userManagement.authenticateWithMagicAuth({
  clientId: 'client_123456789',
  code: '123456',
  email: 'marcelina.davis@example.com',
  ipAddress: '192.0.2.1',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
});
```

### userManagement.authenticateWithMagicAuth()

### Parameters object

- `clientId`: `string`

- `code`: `string`

- `email`: `string`

- `invitationToken?`: `string`

- `ipAddress?`: `string`

- `userAgent?`: `string`

- `session?`: `object`

### Returns object

- `user`: `User`

- `organizationId?`: `string`

- `authenticationMethod`: `"MagicAuth"`

- `sealedSession?`: `string`

## Authenticate with refresh token

Use this endpoint to exchange a refresh token for a new access token. Refresh tokens may be rotated after use, so a replacement refresh token is also provided.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_test_123');

const { refreshToken } =
  await workos.userManagement.authenticateWithRefreshToken({
    clientId: 'client_123456789',
    refreshToken: 'Xw0NsCVXMBf7svAoIoKBmkpEK',
    ipAddress: '192.0.2.1',
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
  });
```

### userManagement.authenticateWithRefreshToken()

### Parameters object

- `clientId`: `string`

- `refresh_token`: `string`

- `organizationId?`: `string`

- `ipAddress?`: `string`

- `userAgent?`: `string`

- `session?`: `object`

### Returns object

- `user`: `User`

- `organizationId?`: `string`

- `accessToken`: `string`

- `refreshToken`: `string`

- `authenticationMethod`: `"SSO" | "Password" | "AppleOAuth" | "GitHubOAuth" | "GoogleOAuth" | "MicrosoftOAuth" | "MagicAuth" | "Impersonation"`

- `impersonator?`: `object`

- `sealedSession?`: `string`

## Authenticate with an email verification code

Authenticates a user with an unverified email and verifies their email address.

A user with an unverified email address won’t be able to authenticate right away. When they attempt to authenticate with their credentials, the API will return an email verification required error that contains a pending authentication token.

If the email setting for email verification is enabled, WorkOS will automatically send a one-time email verification code to the user’s email address. If the email setting is not enabled, retrieve the email verification code to send the email yourself. Use the pending authentication token from the error and the one-time code the user received to authenticate them and to complete the email verification process.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { user } = await workos.userManagement.authenticateWithEmailVerification({
  clientId: 'client_123456789',
  code: '123456',
  pendingAuthenticationToken: 'ql1AJgNoLN1tb9llaQ8jyC2dn',
  ipAddress: '192.0.2.1',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
});
```

### userManagement.authenticateWithEmailVerification()

### Parameters object

- `clientId`: `string`

- `code`: `string`

- `pendingAuthenticationToken`: `string`

- `ipAddress?`: `string`

- `userAgent?`: `string`

- `session?`: `object`

### Returns object

- `user`: `User`

- `organizationId?`: `string`

- `authenticationMethod`: `"SSO" | "Password" | "AppleOAuth" | "GitHubOAuth" | "GoogleOAuth" | "MicrosoftOAuth" | "MagicAuth" | "Impersonation"`

- `sealedSession?`: `string`

Authenticate with a time-based one-time password
Authenticates a user enrolled into MFA using time-based one-time password (TOTP).

Users enrolled into MFA are required to enter a TOTP each time they sign in. When they attempt to authenticate with their credentials, the API will return an MFA challenge error that contains a pending authentication token.

To continue with the authentication flow, challenge one of the factors returned by the MFA challenge error response and present a UI to the user to enter the TOTP code. Then, authenticate the user with the TOTP code, the challenge from the factor, and the pending authentication token from the MFA challenge error.

MFA can be enabled via the
Authentication page
in the WorkOS dashboard.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { user } = await workos.userManagement.authenticateWithTotp({
  clientId: 'client_123456789',
  code: '123456',
  pendingAuthenticationToken: 'ql1AJgNoLN1tb9llaQ8jyC2dn',
  authenticationChallengeId: 'auth_challenge_01FVYZWQTZQ5VB6BC5MPG2EYC5',
  ipAddress: '192.0.2.1',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
});
```

### userManagement.authenticateWithTotp()

### Parameters

- `clientId`: `string`

- `code`: `string`

- `authenticationChallengeId`: `string`

- `pendingAuthenticationToken`: `string`

- `ipAddress?`: `string`

- `userAgent?`: `string`

- `session?`: `object`

### Returns object

- `user`: `User`

- `organizationId?`: `string`

- `authenticationMethod`: `"SSO" | "Password" | "AppleOAuth" | "GitHubOAuth" | "GoogleOAuth" | "MicrosoftOAuth" | "MagicAuth" | "Impersonation"`

- `sealedSession?`: `string`

## Authenticate with organization selection

Authenticates a user into an organization they are a member of.

When a user who is a member of multiple organizations attempts to authenticate with their credentials, the API will return an organization selection error that contains a pending authentication token. To continue with the authentication flow, your application should display the list of organizations for the user to choose.

Use the pending authentication token from the error and the organization the user selected in your UI to complete the authentication.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { user } =
  await workos.userManagement.authenticateWithOrganizationSelection({
    clientId: 'client_123456789',
    organizationId: 'org_01H945H0YD4F97JN9MATX7BYAG',
    pendingAuthenticationToken: 'ql1AJgNoLN1tb9llaQ8jyC2dn',
    ipAddress: '192.0.2.1',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  });
```

### userManagement.authenticateWithOrganizationSelection()

### Parameters

- `clientId`: `string`

- `pendingAuthenticationToken`: `string`

- `organizationId`: `string`

- `ipAddress?`: `string`

- `userAgent?`: `string`

- `session?`: `object`

### Returns object

- `user`: `User`

- `organizationId?`: `string`

- `authenticationMethod`: `"SSO" | "Password" | "AppleOAuth" | "GitHubOAuth" | "GoogleOAuth" | "MicrosoftOAuth" | "MagicAuth" | "Impersonation"`

- `sealedSession?`: `string`

## Authenticate with session cookie

Authenticates a user using an AuthKit session cookie. This method does not make a network call, but simply unseals an existing session cookie and decodes the JWT claims from the access token.

```javascript
import {
  AuthenticateWithSessionCookieFailureReason,
  WorkOS,
} from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789', {
  // clientId is required to be passed in to use the authenticateWithSessionCookie method
  clientId: 'client_123456789',
});

const { authenticated, ...restOfAuthenticationResponse } =
  await workos.userManagement.authenticateWithSessionCookie({
    sessionData: 'sealed_session_cookie_data',
    cookiePassword: 'password_previously_used_to_seal_session_cookie',
  });

if (authenticated) {
  // User is authenticated and session data can be utilized
  const { sessionId, organizationId, role, permissions } =
    restOfAuthenticationResponse;
} else {
  const { reason } = restOfAuthenticationResponse;

  // Can use AuthenticateWithSessionCookieFailureReason to handle failure reasons
  if (
    reason ===
    AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED
  ) {
    // Redirect the user to the login page
  }
}
```

### userManagement.authenticateWithSessionCookie()

### Parameters object

- `sessionData`: `string`

- `cookiePassword`: `string`

### Returns object

- `authenticated`: `boolean`

- `sessionId`: `string`

- `organizationId?`: `string`

- `role?`: `string`

- `roles?`: `array`

- `permissions?`: `string`

- `reason?`: `"invalid_jwt" | "invalid_session_cookie" | "no_session_cookie_provided"`

## Refresh and seal session data

Unseals the provided session data from a user’s session cookie, authenticates with the existing refresh token, and returns the sealed data for the refreshed session.

```javascript
import {
  RefreshAndSealSessionDataFailureReason,
  WorkOS,
} from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789', {
  // clientId is required to be passed in to use the refreshAndSealSessionData method
  clientId: 'client_123456789',
});

const { authenticated, ...restOfRefreshResponse } =
  await workos.userManagement.refreshAndSealSessionData({
    sessionData: 'sealed_session_cookie_data',
    cookiePassword: 'password_previously_used_to_seal_session_cookie',
  });

if (authenticated) {
  const { sealedSession } = restOfRefreshResponse;

  // Set the sealed session in a cookie
} else {
  const { reason } = restOfRefreshResponse;

  // Can use RefreshAndSealSessionDataFailureReason to handle failure reasons
  if (
    reason === RefreshAndSealSessionDataFailureReason.NO_SESSION_COOKIE_PROVIDED
  ) {
    // Redirect the user to the login page
  }
}
```

### userManagement.refreshAndSealSessionData()

### Parameters object

- `sessionData`: `string`

- `cookiePassword`: `string`

### Returns object

- `authenticated`: `boolean`

- `sealedSession`: `string`

- `reason?`: `"invalid_jwt" | "invalid_session_cookie" | "no_session_cookie_provided" | "invalid_grant" | "organization_not_authorized"`

## Session tokens

JWKS URL
This hosts the public key that is used for verifying access tokens.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_test_123');

const jwksUrl = workos.userManagement.getJwksUrl('client_123456789');
```

### userManagement.getJwksUrl()

### Parameters

- `clientId`: `string`

### Returns

- `jwksUrl`: `string`

## Access token

The access token that is returned in successful authentication responses is a JWT that can be used to verify that a user has an active session. The JWT is signed by a JWKS which can be retrieved from the WorkOS API.

Decoded access token

```json
{
  "iss": "https://api.workos.com",
  "sub": "user_01HBEQKA6K4QJAS93VPE39W1JT",
  "act": {
    "sub": "admin@foocorp.com"
  },
  "org_id": "org_01HRDMC6CM357W30QMHMQ96Q0S",
  "role": "member",
  "roles": ["member"],
  "permissions": ["posts:read", "posts:write"],
  "entitlements": ["audit-logs"],
  "sid": "session_01HQSXZGF8FHF7A9ZZFCW4387R",
  "jti": "01HQSXZXPPFPKMDD32RKTFY6PV",
  "exp": 1709193857,
  "iat": 1709193557
}
Access Token JWT

iss: string

sub: string

act?: object

org_id: string

role: string

roles: array

permissions?: string[]

entitlements?: string[]

sid: string

jti: string

exp: DateTime

iat: DateTime
```

## Refresh token

The refresh token can be used to obtain a new access token using the authenticate with refresh token endpoint. Refresh tokens may only be used once. Refreshes will succeed as long as the user’s session is still active.

## Session

Represents an authenticated user’s connection to your application. A session is created when a user signs in through AuthKit and contains information about the authentication method, device details, and session status.

## Session

```json
{
  "object": "session",
  "id": "session_01E4ZCR3C56J083X43JQXF3JK5",
  "user_id": "user_01E4ZCR3C56J083X43JQXF3JK5",
  "organization_id": "org_01E4ZCR3C56J083X43JQXF3JK5",
  "status": "active",
  "auth_method": "password",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "expires_at": "2025-07-23T15:00:00.000Z",
  "ended_at": null,
  "created_at": "2025-07-23T14:00:00.000Z",
  "updated_at": "2025-07-23T14:00:00.000Z"
}
List sessions
Get a list of all active sessions for a specific user.

import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const sessions = await workos.userManagement.listSessions(
  'user_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### userManagement.listSessions()

### Parameters

- `userId`: `string`

- `options?`: `object`

### Returns object

- `data`: `Session[]`

- `listMetadata`: `object`

## Revoke session

Revoke a session.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.userManagement.revokeSession({
  sessionId: 'session_01E4ZCR3C56J083X43JQXF3JK5',
});
```

### userManagement.revokeSession()

### Parameters object

- `sessionId`: `string`

## Session helpers

After authenticating and storing the encrypted session as a cookie, retrieving and decrypting the session is made easy via the session helper methods.

## Load sealed session

Load the session by providing the sealed session and the cookie password.

## Load sealed session

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789', {
  clientId: 'client_123456789',
});

const session = await workos.userManagement.loadSealedSession({
  sessionData: 'sealed_session_cookie_data',
  cookiePassword: 'password_previously_used_to_seal_session_cookie',
});
```

### userManagement.loadSealedSession()

### Parameters object

- `sessionData`: `string`

- `cookiePassword`: `string`

### Returns object

- `authenticate`: `function`

- `refresh`: `function`

- `getLogOutUrl`: `function`

Authenticate
Unseals the session data and checks if the session is still valid.

Authenticate

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789', {
  clientId: 'client_123456789',
});

const session = await workos.userManagement.loadSealedSession({
  sessionData: 'sealed_session_cookie_data',
  cookiePassword: 'password_previously_used_to_seal_session_cookie',
});

const authResponse = await session.authenticate();

if (authResponse.authenticated) {
  // User is authenticated and session data can be used
  const { sessionId, organizationId, role, permissions, user } = authResponse;
} else {
  if (authResponse.reason === 'no_session_cookie_provided') {
    // Redirect the user to the login page
  }
}
```

### session.authenticate()

### Returns object

- `authenticated`: `boolean`

- `accessToken`: `string`

- `sessionId`: `string`

- `user`: `User`

- `organizationId?`: `string`

- `role?`: `string`

- `roles?`: `array`

- `permissions?`: `array`

- `entitlements?`: `array`

- `featureFlags?`: `array`

- `impersonator?`: `object`

- `reason?`: `"invalid_jwt" | "invalid_session_cookie" | "no_session_cookie_provided"`

Refresh
Refreshes the user’s session with the refresh token. Passing in a new organization ID will switch the user to that organization.

Refresh

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789', {
  clientId: 'client_123456789',
});

const session = await workos.userManagement.loadSealedSession({
  sessionData: 'sealed_session_cookie_data',
  cookiePassword: 'password_previously_used_to_seal_session_cookie',
});

const refreshResult = await session.refresh();

if (!refreshResult.authenticated) {
  // Redirect the user to the login page
}

const {
  session: userSession,
  sealedSession,
  user,
  organizationId,
  role,
  permissions,
  entitlements,
  impersonator,
} = refreshResult;

// Use claims and userSession for further business logic

// Set the sealedSession in a cookie
```

### session.refresh()

### Parameters object

- `cookiePassword?`: `string`

- `organizationId?`: `string`

Returns RefreshSessionResponse

- `authenticated`: `boolean`

- `session`: `object`

- `sealedSession`: `string`

- `sessionId`: `string`

- `user`: `User`

- `organizationId?`: `string`

- `role?`: `string`

- `roles?`: `array`

- `permissions?`: `array`

- `entitlements?`: `array`

- `featureFlags?`: `array`

- `impersonator?`: `object`

- `reason?`: `string`

## Get log out URL

End a user’s session. The user’s browser should be redirected to this URL. Functionally similar to Get logout URL but extracts the session ID automatically from the session data.

## Get log out URL

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789', {
  clientId: 'client_123456789',
});

const session = await workos.userManagement.loadSealedSession({
  sessionData: 'sealed_session_cookie_data',
  cookiePassword: 'password_previously_used_to_seal_session_cookie',
});

const logOutUrl = await session.getLogOutUrl();

// Redirect the user to the log out URL
```

### session.getLogOutUrl()

### Returns

- `logOutUrl`: `string`

## Authentication errors

Integrating the authentication API directly requires handling error responses for email verification, MFA challenges, identity linking, and organization selection. One or more of these responses may be returned for an authentication attempt with any authentication method.

Hosted AuthKit handles authentication errors for you and may be a good choice if you prefer a simpler integration.

Email verification required error
This error indicates that a user with an unverified email address attempted to authenticate in an environment where email verification is required. It includes a pending authentication token that should be used to complete the authentication.

Email verification required error

```json
{
  "code": "email_verification_required",
  "message": "Email ownership must be verified before authentication.",
  "pending_authentication_token": "YQyCkYfuVw2mI3tzSrk2C1Y7S",
  "email": "marcelina.davis@example.com",
  "email_verification_id": "email_verification_01HYGGEB6FYMWQNWF3XDZG7VV3"
}
Sends email
email_verification_required

code: "email_verification_required"

message: string

pending_authentication_token: string

email: string

email_verification_id: string
When this error occurs and the email setting for email verification is enabled, WorkOS will automatically send a one-time email verification code to the user’s email address and issue a pending authentication token. If the email setting is not enabled, retrieve the email verification code to send the email verification email yourself. To complete the authentication process, use the pending authentication token from the error and the one-time code the user received to authenticate them and to verify their email address.

The same applies when a user attempts to authenticate with OAuth or SSO, but there was already an account with a matching unverified email address.

MFA enrollment error
This error indicates that a user who is not enrolled into MFA attempted to authenticate in an environment where MFA is required. It includes a pending authentication token that should be used to authenticate the user once they enroll into MFA.

MFA enrollment error
JSON
{
  "code": "mfa_enrollment",
  "message": "The user must enroll in MFA to finish authenticating.",
  "pending_authentication_token": "YQyCkYfuVw2mI3tzSrk2C1Y7S",
  "user": {
    "object": "user",
    "id": "user_01E4ZCR3C56J083X43JQXF3JK5",
    "email": "marcelina.davis@example.com",
    "first_name": "Marcelina",
    "last_name": "Davis",
    "email_verified": true,
    "profile_picture_url": "https://workoscdn.com/images/v1/123abc",
    "created_at": "2021-06-25T19: 07: 33.155Z",
    "updated_at": "2021-06-25T19: 07: 33.155Z"
  }
}
mfa_enrollment

code: "mfa_enrollment"

message: string

pending_authentication_token: string

user: user
When this error occurs, you’ll need to present an MFA enrollment UI to the user. Once the user has enrolled, present an MFA challenge UI to the user and authenticate them with their TOTP code and the pending authentication token from this error.

MFA can be enabled via the
Authentication page
 in the WorkOS dashboard.

MFA challenge error
This error indicates that a user enrolled into MFA attempted to authenticate in an environment where MFA is required. It includes a pending authentication token and a list of factors that the user is enrolled in that should be used to complete the authentication.

MFA challenge error
JSON
{
  "code": "mfa_challenge",
  "message": "The user must complete an MFA challenge to finish authenticating.",
  "pending_authentication_token": "YQyCkYfuVw2mI3tzSrk2C1Y7S",
  "authentication_factors": [
    {
      "id": "auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ",
      "type": "totp"
    }
  ],
  "user": {
    "object": "user",
    "id": "user_01E4ZCR3C56J083X43JQXF3JK5",
    "email": "marcelina.davis@example.com",
    "first_name": "Marcelina",
    "last_name": "Davis",
    "email_verified": true,
    "profile_picture_url": "https://workoscdn.com/images/v1/123abc",
    "created_at": "2021-06-25T19:07:33.155Z",
    "updated_at": "2021-06-25T19:07:33.155Z"
  }
}
mfa_challenge

code: "mfa_challenge"

message: string

pending_authentication_token: string

authentication_factors: array

user: user
When this error occurs, you’ll need to present an MFA challenge UI to the user and authenticate them with their TOTP code, the pending authentication token from this error, and a challenge that corresponds to one of the authentication factors.

MFA can be enabled via the
Authentication page
 in the WorkOS dashboard.

Organization selection required error
This error indicates that the user is a member of multiple organizations and must select which organization to sign in to. It includes a list of organizations the user is a member of and a pending authentication token that should be used to complete the authentication.

Organization selection required error
JSON
{
  "code": "organization_selection_required",
  "message": "The user must choose an organization to finish their authentication.",
  "pending_authentication_token": "YQyCkYfuVw2mI3tzSrk2C1Y7S",
  "organizations": [
    {
      "id": "org_01H93RZAP85YGYZJXYPAZ9QTXF",
      "name": "Foo Corp"
    },
    {
      "id": "org_01H93S4E6GB5A8PFNKGTA4S42X",
      "name": "Bar Corp"
    }
  ],
  "user": {
    "object": "user",
    "id": "user_01E4ZCR3C56J083X43JQXF3JK5",
    "email": "marcelina.davis@example.com",
    "first_name": "Marcelina",
    "last_name": "Davis",
    "email_verified": true,
    "profile_picture_url": "https://workoscdn.com/images/v1/123abc",
    "created_at": "2021-06-25T19:07:33.155Z",
    "updated_at": "2021-06-25T19:07:33.155Z"
  }
}
organization_selection_required

code: "organization_selection_required"

message: string

pending_authentication_token: string

user: user

organizations: array
When this error occurs, you’ll need to display the list of organizations that the user is a member of and authenticate them with the selected organization using the pending authentication token from the error.

SSO required error
This error indicates that a user attempted to authenticate into an organization that requires SSO using a different authentication method. It includes a list of SSO connections that may be used to complete the authentication.

SSO required error
JSON
{
  "error": "sso_required",
  "error_description": "User must authenticate using one of the matching connections.",
  "connection_ids": ["conn_01DRF1T7JN6GXS8KHS0WYWX1YD"]
}
sso_required

error: "sso_required"

error_description: string

email: string

connection_ids: array

pending_authentication_token?: string
When this error occurs, you’ll need to use one of the SSO connections from the error to get the authorization URL and redirect the user to that URL to complete the authentication with the organization’s identity provider.

Organization authentication required error
This error indicates that a user attempted to authenticate with an authentication method that is not allowed by the organization that has a domain policy managing this user. It includes all the possible methods the user can use to authenticate.

Organization authentication required error
JSON
{
  "error": "organization_authentication_methods_required",
  "error_description": "User must authenticate using one of the methods allowed by the organization.",
  "sso_connection_ids": ["conn_01DRF1T7JN6GXS8KHS0WYWX1YD"],
  "auth_methods": {
    "apple_oauth": false,
    "github_oauth": false,
    "google_oauth": true,
    "magic_auth": false,
    "microsoft_oauth": false,
    "password": false
  }
}
organization_authentication_methods_required

error: "organization_authentication_methods_required"

error_description: string

email: string

sso_connection_ids: array

auth_methods: object
When this error occurs, you’ll need to present the user with these options so they can choose which method to continue authentication.

```

## Magic Auth

Magic Auth is a passwordless authentication method that allows users to sign in or sign up via a unique, six digit one-time-use code sent to their email inbox. To verify the code, authenticate the user with Magic Auth.

### Example Magic Auth

```javascript
const magicAuth = {
  object: 'magic_auth',
  id: 'magic_auth_01E4ZCR3C56J083X43JQXF3JK5',
  userId: 'user_01HWWYEH2NPT48X82ZT23K5AX4',
  email: 'marcelina.davis@example.com',
  expiresAt: '2021-07-01T19:07:33.155Z',
  code: '123456',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
};
```

#### `interface MagicAuth`

- `object`: `"magic_auth"`

- `id`: `string`

- `userId`: `string`

- `email`: `string`

- `expiresAt`: `string`

- `code`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

## Get a Magic Auth code

Get the details of an existing Magic Auth code that can be used to send an email to a user for authentication.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const magicAuth = await workos.userManagement.getMagicAuth(
  'magic_auth_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### userManagement.getMagicAuth()

### Parameters

- `id`: `string`

### Returns

MagicAuth

## Create a Magic Auth code

Creates a one-time authentication code that can be sent to the user’s email address. The code expires in 10 minutes. To verify the code, authenticate the user with Magic Auth.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const magicAuth = await workos.userManagement.createMagicAuth({
  email: 'marcelina@example.com',
});
Sends email
```

### userManagement.createMagicAuth()

### Parameters object

- `email`: `string`

- `invitationToken?`: `string`

### Returns

MagicAuth

## Multi-Factor Authentication

Enroll users in multi-factor authentication for an additional layer of security. MFA can be enabled via the
Authentication page
in the WorkOS dashboard.

Authentication factor
Represents an authentication factor.

Authentication factor

```javascript
const factor = {
  object: 'authentication_factor',
  id: 'auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ',
  createdAt: '2022-02-15T15:14:19.392Z',
  updatedAt: '2022-02-15T15:14:19.392Z',
  type: 'totp',
  totp: {
    issuer: 'Foo Corp',
    user: 'alan.turing@example.com',
    qrCode: 'data:image/png;base64,{base64EncodedPng}',
    secret: 'NAGCCFS3EYRB422HNAKAKY3XDUORMSRF',
    uri: 'otpauth://totp/FooCorp:alan.turing@example.com?secret=NAGCCFS3EYRB422HNAKAKY3XDUORMSRF&issuer=FooCorp',
  },
  userId: 'user_01FVYZ5QM8N98T9ME5BCB2BBMJ',
};
```

#### `interface Factor`

- `object`: `"authentication_factor"`

- `id`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `type`: `"totp"`

- `totp`: `object`

- `issuer`: `string`

- `user`: `string`

- `qrCode`: `string`

- `secret`: `string`

- `uri`: `string`

- `userId`: `string`

Authentication challenge
Represents a challenge of an authentication factor.

Authentication challenge

```javascript
const challenge = {
  object: 'authentication_challenge',
  id: 'auth_challenge_01FVYZWQTZQ5VB6BC5MPG2EYC5',
  createdAt: '2022-02-15T15:26:53.274Z',
  updatedAt: '2022-02-15T15:26:53.274Z',
  expiresAt: '2022-02-15T15:36:53.279Z',
  authenticationFactorId: 'auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ',
};
```

#### `interface Challenge`

- `object`: `"authentication_challenge"`

- `id`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `expiresAt`: `string`

- `authenticationFactorId`: `string`

## Enroll an authentication factor

Enrolls a user in a new authentication factor.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { authenticationFactor, authenticationChallenge } =
  await workos.userManagement.enrollAuthFactor({
    userId: 'user_01E4ZCR3C56J083X43JQXF3JK5',
    type: 'totp',
    totpIssuer: 'WorkOS',
    totpUser: 'bob@example.com',
  });
```

### userManagement.enrollAuthFactor()

### Parameters object

- `userId`: `string`

- `type`: `"totp"`

- `totpIssuer?`: `string`

- `totpUser?`: `string`

- `totpSecret?`: `string`

### Returns object

- `authenticationChallenge`: `Challenge`

- `authenticationFactor`: `Factor`

## List authentication factors

Lists the authentication factors for a user.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const authFactors = await workos.userManagement.listAuthFactors({
  userId: 'user_01E4ZCR3C56J083X43JQXF3JK5',
});

console.log(authFactors.data);
```

### userManagement.listAuthFactors()

### Parameters

- `userId`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `Factor[]`

- `listMetadata`: `object`

## Email verification

Email verification is a security feature that requires users to verify their email address before they can sign in to your application. It is enabled by default.

Users signing in with Magic Auth, Google OAuth, Apple OAuth, or SSO are automatically verified. For other authentication methods, an email verification flow is required to confirm that the user’s email address belongs to them.

### Example email verification

```javascript
const emailVerification = {
  object: 'email_verification',
  id: 'email_verification_01HYGGEB6FYMWQNWF3XDZG7VV3',
  userId: 'user_01HWWYEH2NPT48X82ZT23K5AX4',
  email: 'marcelina.davis@example.com',
  expiresAt: '2021-07-01T19:07:33.155Z',
  code: '123456',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
};
```

#### `interface EmailVerification`

- `object`: `"email_verification"`

- `id`: `string`

- `userId`: `string`

- `email`: `string`

- `expiresAt`: `string`

- `code`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

## Get an email verification code

Get the details of an existing email verification code that can be used to send an email to a user for verification.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const emailVerification = await workos.userManagement.getEmailVerification(
  'email_verification_01HYGGEB6FYMWQNWF3XDZG7VV3',
);
```

### userManagement.getEmailVerification()

### Parameters

- `id`: `string`

### Returns

EmailVerification

## Password reset

Create a password reset token for a user and reset the user’s password.

When a user’s password is reset, all of their active sessions are revoked.

### Example Password reset

```javascript
const passwordReset = {
  object: 'password_reset',
  id: 'password_reset_01HYGDNK5G7FZ4YJFXYXPB5JRW',
  userId: 'user_01HWWYEH2NPT48X82ZT23K5AX4',
  email: 'marcelina.davis@example.com',
  passwordResetToken: 'Z1uX3RbwcIl5fIGJJJCXXisdI',
  passwordResetUrl:
    'https://your-app.com/reset-password?token=Z1uX3RbwcIl5fIGJJJCXXisdI',
  expiresAt: '2025-07-14T18:00:54.578Z',
  createdAt: '2025-07-14T17:45:54.578Z',
};
```

#### `interface PasswordReset`

- `object`: `"password_reset"`

- `id`: `string`

- `userId`: `string`

- `email`: `string`

- `passwordResetToken`: `string`

- `passwordResetUrl`: `string`

- `expiresAt`: `string`

- `createdAt`: `string`

## Get a password reset token

Get the details of an existing password reset token that can be used to reset a user’s password.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const passwordReset = await workos.userManagement.getPasswordReset(
  'password_reset_01HYGDNK5G7FZ4YJFXYXPB5JRW',
);
```

### userManagement.getPasswordReset()

### Parameters

- `id`: `string`

### Returns

PasswordReset

## Create a password reset token

Creates a one-time token that can be used to reset a user’s password.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const passwordReset = await workos.userManagement.createPasswordReset({
  email: 'marcelina@example.com',
});
Sends email
```

### userManagement.createPasswordReset()

### Parameters object

- `email`: `string`

### Returns

PasswordReset

## Reset the password

Sets a new password using the token query parameter from the link that the user received. Successfully resetting the password will verify a user’s email, if it hasn’t been verified yet.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { user } = await workos.userManagement.resetPassword({
  token: 'stpIJ48IFJt0HhSIqjf8eppe0',
  newPassword: 'i8uv6g34kd490s',
});
```

### userManagement.resetPassword()

### Parameters

- `token`: `string`

- `newPassword`: `string`

### Returns object

- `user`: `User`

## Organization membership

An organization membership is a top-level resource that represents a user’s relationship with an organization. A user may be a member of zero, one, or many organizations.

See the events reference documentation for the organization membership events.

### Example organization membership

```javascript
const organizationMembership = {
  object: 'organization_membership',
  id: 'om_01E4ZCR3C56J083X43JQXF3JK5',
  userId: 'user_01E4ZCR3C5A4QZ2Z2JQXGKZJ9E',
  organizationId: 'org_01E4ZCR3C56J083X43JQXF3JK5',
  organizationName: 'Foo Corp',
  role: {
    slug: 'admin',
  },
  roles: [
    {
      slug: 'admin',
    },
  ],
  status: 'active',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
};
```

#### `interface OrganizationMembership`

- `object`: `"organization_membership"`

- `id`: `string`

- `userId`: `string`

- `organizationId`: `string`

- `organizationName`: `string`

- `role`: `object`

- `roles`: `array`

- `status`: `"active" | "inactive" | "pending"`

- `createdAt`: `string`

- `updatedAt`: `string`

## Get an organization membership

Get the details of an existing organization membership.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organizationMembership =
  await workos.userManagement.getOrganizationMembership(
    'om_01E4ZCR3C56J083X43JQXF3JK5',
  );
```

### userManagement.getOrganizationMembership()

### Parameters object

- `id`: `string`

### Returns

OrganizationMembership

## List organization memberships

Get a list of all organization memberships matching the criteria specified. At least one of user_id or organization_id must be provided. By default only active memberships are returned. Use the statuses parameter to filter by other statuses.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organizationMemberships =
  await workos.userManagement.listOrganizationMemberships({
    userId: 'user_01E4ZCR3C5A4QZ2Z2JQXGKZJ9E',
  });

console.log(organizationMemberships.data);
```

### userManagement.listOrganizationMemberships()

### Parameters object

- `userId?`: `string`

- `organizationId?`: `string`

- `statuses?`: `OrganizationMembershipStatus[]`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `array`

- `list_metadata`: `object`

## Create an organization membership

Creates a new active organization membership for the given organization and user.

Calling this API with an organization and user that match an inactive organization membership will activate the membership with the specified role(s).

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organizationMembership =
  await workos.userManagement.createOrganizationMembership({
    organizationId: 'org_01E4ZCR3C56J083X43JQXF3JK5',
    userId: 'user_01E4ZCR3C5A4QZ2Z2JQXGKZJ9E',
    roleSlug: 'admin',
  });
```

### userManagement.createOrganizationMembership()

### Parameters object

- `userId`: `string`

- `organizationId`: `string`

- `roleSlug?`: `string`

- `roleSlugs?`: `array`

### Returns

OrganizationMembership

## Update an organization membership

Update the details of an existing organization membership.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organizationMembership =
  await workos.userManagement.updateOrganizationMembership(
    'om_01E4ZCR3C56J083X43JQXF3JK5',
    {
      roleSlug: 'admin',
    },
  );
```

### userManagement.updateOrganizationMembership()

Parameters string

- `id`: `string`

- `roleSlug`: `string`

- `roleSlugs?`: `array`

### Returns

OrganizationMembership

## Delete an organization membership

Permanently deletes an existing organization membership. It cannot be undone.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.userManagement.deleteOrganizationMembership(
  'om_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### userManagement.deleteOrganizationMembership()

### Parameters

- `id`: `string`

## Deactivate an organization membership

Deactivates an active organization membership. Emits an organization_membership.updated event upon successful deactivation.

Deactivating an inactive membership is a no-op and does not emit an event.
Deactivating a pending membership returns an error. This membership should be deleted instead.
See the membership management documentation for additional details.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organizationMembership =
  await workos.userManagement.deactivateOrganizationMembership(
    'om_01E4ZCR3C56J083X43JQXF3JK5',
  );
```

### userManagement.deactivateOrganizationMembership()

### Parameters object

- `id`: `string`

### Returns

OrganizationMembership

## Reactivate an organization membership

Reactivates an inactive organization membership, retaining the pre-existing role(s). Emits an organization_membership.updated event upon successful reactivation.

Reactivating an active membership is a no-op and does not emit an event.
Reactivating a pending membership returns an error. The user needs to accept the invitation instead.
See the membership management documentation for additional details.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organizationMembership =
  await workos.userManagement.reactivateOrganizationMembership(
    'om_01E4ZCR3C56J083X43JQXF3JK5',
  );
```

### userManagement.reactivateOrganizationMembership()

### Parameters object

- `id`: `string`

### Returns

OrganizationMembership

## Invitation

An email invitation allows the recipient to sign up for your app and join a specific organization. When an invitation is accepted, a user and a corresponding organization membership are created.

Users may be invited to your app without joining an organization, or they may be invited to join an organization if they already have an account. Invitations may be also issued on behalf of another user. In this case, the invitation email will mention the name of the user who invited the recipient.

### Example invitation

```javascript
const invitation = {
  object: 'invitation',
  id: 'invitation_01E4ZCR3C56J083X43JQXF3JK5',
  email: 'marcelina.davis@example.com',
  state: 'pending',
  acceptedAt: null,
  revokedAt: null,
  expiresAt: '2021-07-01T19:07:33.155Z',
  token: 'Z1uX3RbwcIl5fIGJJJCXXisdI',
  acceptInvitationUrl:
    'https://your-app.com/invite?invitation_token=Z1uX3RbwcIl5fIGJJJCXXisdI',
  organizationId: 'org_01E4ZCR3C56J083X43JQXF3JK5',
  inviterUserId: 'user_01HYGBX8ZGD19949T3BM4FW1C3',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
};
```

#### `interface Invitation`

- `object`: `"invitation"`

- `id`: `string`

- `email`: `string`

- `state`: `"pending" | "accepted" | "revoked" | "expired"`

- `acceptedAt?`: `string`

- `revokedAt?`: `string`

- `expiresAt`: `string`

- `token`: `string`

- `acceptInvitationUrl`: `string`

- `organizationId?`: `string`

- `inviterUserId?`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

## Get an invitation

Get the details of an existing invitation.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const invitation = await workos.userManagement.getInvitation(
  'invitation_01EHZNVPK3SFK441A1RGBFSHRT',
);
```

### userManagement.getInvitation()

### Parameters

- `id`: `string`

### Returns

## Invitation

## Find an invitation by token

Retrieve an existing invitation using the token.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const invitation = await workos.userManagement.findInvitationByToken(
  'Z1uX3RbwcIl5fIGJJJCXXisdI',
);
```

### userManagement.findInvitationByToken()

### Parameters

- `token`: `string`

### Returns

## Invitation

## List invitations

Get a list of all of invitations matching the criteria specified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const invitation = await workos.userManagement.listInvitations({
  organizationId: 'org_123456789',
});

console.log(invitation.data);
```

### userManagement.listInvitations()

### Parameters

- `email?`: `string`

- `organizationId?`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `array`

- `list_metadata`: `object`

## Send an invitation

Sends an invitation email to the recipient.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const invitation = await workos.userManagement.sendInvitation({
  email: 'marcelina@example.com',
});
Sends email
```

### userManagement.sendInvitation()

### Parameters

- `email`: `string`

- `organizationId?`: `string`

- `expiresInDays?`: `int`

- `inviterUserId?`: `string`

- `roleSlug?`: `String`

### Returns

## Invitation

Resend an invitation
Resends an invitation email to the recipient. The invitation must be in a pending state.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const invitation = await workos.userManagement.resendInvitation(
  'invitation_01E4ZCR3C56J083X43JQXF3JK5',
);

console.log(invitation.data);
Sends email
```

### userManagement.resendInvitation()

### Parameters

- `id`: `string`

### Returns

## Invitation

## Accept an invitation

Accepts an invitation and, if linked to an organization, activates the user’s membership in that organization.

In most cases, use existing authentication methods like authenticateWithCode, which also accept an invitation token. These methods offer the same functionality (invitation acceptance and membership activation) while also signing the user in.

This method is useful for apps requiring a highly customized invitation flow, as it focuses solely on handling invitations without authentication. It’s also helpful when users can be invited to multiple organizations and need a way to accept invitations after signing in.

Your application should verify that the invitation is intended for the user accepting it. For example, by fetching the invitation using the find-by-token endpoint and ensuring the email matches the email address of the accepting user.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789', {
  clientId: 'client_123456789',
});

const invitation = await workos.userManagement.acceptInvitation(
  'invitation_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### userManagement.acceptInvitation()

### Parameters

- `id`: `string`

### Returns

## Invitation

## Revoke an invitation

Revokes an existing invitation.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const invitation = await workos.userManagement.revokeInvitation(
  'invitation_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### userManagement.revokeInvitation()

### Parameters

- `id`: `string`

### Returns

## Invitation

# Logout

End a user’s session. The user’s browser should be redirected to this URL.

## Get logout URL

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_test_123');

const logoutUrl = workos.userManagement.getLogoutUrl({
  sessionId: 'session_01HQAG1HENBZMAZD82YRXDFC0B',
  returnTo: 'https://your-app.com/signed-out',
});
```

### userManagement.getLogoutUrl()

### Parameters object

- `sessionId`: `string`

- `returnTo?`: `string`

### Returns

- `url`: `string`

## Get logout URL from session cookie

Generates the logout URL by extracting the session ID from the session cookie. Use this over getLogoutUrl if you don’t have a saved reference to the session ID and you’d like the SDK to handle extracting the session ID from the cookie for you.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_test_123');

const logoutUrl = workos.userManagement.getLogoutUrlFromSessionCookie({
  sessionData: 'sealed_session_cookie_data',
  cookiePassword: 'password_previously_used_to_seal_session_cookie',
});
```

### userManagement.getLogoutUrlFromSessionCookie()

### Parameters object

- `sessionData`: `string`

- `cookiePassword?`: `string`

- `returnTo?`: `string`

### Returns

- `url`: `string`

# CLI Auth

CLI Auth enables command-line applications to authenticate users through the web using the
OAuth 2.0 Device Authorization Flow
.

The CLI Auth flow involves two main endpoints:

The device authorization URL initiates the flow by obtaining a device code, user code, and verification URIs.
The device access token URL is where the device exchanges the device code for access and refresh tokens after the user authenticates.
Read more about CLI Auth here.

## Get device authorization URL

Initiates the CLI Auth flow by requesting a device code and verification URLs. This endpoint implements the OAuth 2.0 Device Authorization Flow (
RFC 8628
) and is designed for command-line applications or other devices with limited input capabilities.

```bash
curl -X POST 'https://api.workos.com/user_management/authorize/device' \
  -d client_id=client_123456789
```

**POST**

`/user_management/authorize/device`

### Parameters

- `client_id`: `string`

### Returns

- `device_code`: `string`

- `user_code`: `string`

- `verification_uri`: `string`

- `verification_uri_complete`: `string`

- `expires_in`: `integer`

- `interval`: `integer`

Device code
Exchanges a device code for access and refresh tokens as part of the CLI Auth flow. This endpoint should be polled repeatedly until the user authorizes the request, declines it, or the device code expires.

```bash
curl -X POST 'https://api.workos.com/user_management/authenticate' \
  -d 'grant_type=urn:ietf:params:oauth:grant-type:device_code' \
  -d 'device_code=ETaHpDNhfxu0HyLhp6b8HGSh26NzYJSKw3TT6aS7HKKBhTyTD0zAW6ApTTolug0b' \
  -d 'client_id=client_123456789'
```

**POST**

`/user_management/authenticate`

### Parameters

grant_type: "urn:ietf:params:oauth:grant-type:device_code"

- `device_code`: `string`

- `client_id`: `string`

### Returns

- `access_token`: `string`

- `refresh_token`: `string`

- `token_type`: `"Bearer"`

- `expires_in`: `integer`

## Error codes

When polling the device code endpoint, you may receive various error responses before the user completes authorization or if authorization fails. These errors help your application understand the current state and take appropriate action.

Possible error codes and the corresponding descriptions are listed below.

| Error code | Description |
|---|---|
| authorization_pending | The authorization request is still pending as the user hasn’t yet completed the user interaction flow. Continue polling at the specified interval. |
| slow_down | The client is polling too frequently and should slow down. Increase your polling interval by at least 5 seconds and continue polling. |
| access_denied | The user declined the authorization request. Stop polling and inform the user that authorization was denied. |
| expired_token | The device code has expired (typically after 5 minutes). Stop polling and restart the authorization flow if needed. |
| invalid_request | The request is missing a required parameter or includes an invalid parameter value. Check that grant_type, device_code, and client_id are provided and correct. |
| invalid_client | Client authentication failed (e.g., unknown client, client authentication not included, or unsupported authentication method). |
| invalid_grant | The provided device code is invalid, malformed, or has already been used. |
| unsupported_grant_type | The grant type is not supported. Ensure you’re using urn:ietf:params:oauth:grant-type:device_code. |

Error response format
All error responses are returned with a `400` status code and follow the OAuth 2.0 error response format. For example:

{
"error": "authorization_pending",
"error_description": "The authorization request is still pending as the user hasn't yet completed the user interaction flow."
}

# API Keys

API keys provide a secure way for your application’s users to authenticate with your API. Organization admins create API keys through the API Keys Widget, and your application can validate these keys to authenticate API requests.

Read more about API keys in AuthKit.

API Key

```json
{
  "object": "api_key",
  "id": "api_key_01E4ZCR3C56J083X43JQXF3JK5",
  "owner": {
    "type": "organization",
    "id": "org_01EHWNCE74X7JSDV0X3SZ3KJNY"
  },
  "name": "Production API Key",
  "obfuscated_value": "sk_...3456",
  "permissions": ["posts:read", "posts:write"],
  "created_at": "2021-06-25T19:07:33.155Z",
  "updated_at": "2021-06-25T19:07:33.155Z",
  "last_used_at": "2021-06-25T19:07:33.155Z"
}
List organization API keys
Get a list of all API keys for the provided organization.

cURL
curl --request GET \
  --url "https://api.workos.com/organizations/org_01EHWNCE74X7JSDV0X3SZ3KJNY/api_keys" \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

`/organizations/:id/api_keys`

### Parameters

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `array`

- `list_metadata`: `object`

## Create organization API key

Creates a new API key for the specified organization. The response includes the full API key value, which is only returned once at creation time. Make sure to store this value securely as it cannot be retrieved again.

You can optionally specify permissions to control what actions the API key can perform. If no permissions are provided, the key will have no specific permissions assigned.

```bash
curl --request POST \
  --url "https://api.workos.com/organizations/org_01EHWNCE74X7JSDV0X3SZ3KJNY/api_keys" \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  -d @- <<BODY
  {
    "name": "Production API Key",
    "permissions": ["posts:read", "posts:write"]
  }
BODY
```

**POST**

`/organizations/:id/api_keys`

### Parameters

- `organization_id`: `string`

- `name`: `string`

- `permissions?`: `array`

### Returns

api_key

## Delete API key

Permanently deletes an API key. This action cannot be undone. Once deleted, any requests using this API key will fail authentication.

```bash
curl --request DELETE \
  --url "https://api.workos.com/api_keys/api_key_01E4ZCR3C56J083X43JQXF3JK5" \
  --header "Authorization: Bearer sk_example_123456789"
```

**DELETE**

`/api_keys/:id`

### Parameters

- `id`: `string`

Validate API key
Validates an API key and returns its associated metadata if the key is valid. Your application’s API uses this endpoint to authenticate incoming requests that include an API key.

The endpoint returns the complete API key object when validation succeeds, allowing you to access the key’s permissions and owner information for authorization purposes. If the key is invalid, the endpoint returns null for the api_key field.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const result = await workos.apiKeys.validateApiKey({
  value: 'sk_abcdefghijklmnop123456',
});
```

# Directory Sync

Directory Sync allows you to connect with directory providers to inform your application of any changes in their users, groups, or access rules.

Using Directory Sync, one integration grants your application the ability to support multiple directory providers. Get real-time updates of any changes to the organization’s access rules, groups, and users by integrating webhooks into your application.

To automatically respond to changes in the connected directories and their users and groups, use the Directory Sync events.

## Directory

A directory stores information about an organization’s employee management system.

Synchronizing with a directory enables you to receive changes to an organization’s user and group structure.

Directory providers vary in implementation details and may require different sets of fields for integration, such as API keys, subdomains, endpoints, usernames, etc. Where available, the WorkOS API will provide these fields when fetching directory records.

### Example Directory

```javascript
const directory = {
  object: 'directory',
  id: 'directory_01ECAZ4NV9QMV47GW873HDCX74',
  domain: 'foo-corp.com',
  name: 'Foo Corp',
  organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  state: 'inactive',
  type: 'gsuite directory',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
};
```

#### `interface Directory`

- `object`: `"directory"`

- `id`: `string`

- `domain`: `string`

- `externalKey`: `string`

- `name`: `string`

- `organizationId?`: `string`

- `state`: `DirectoryState`

- `type`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

## Get a Directory

Get the details of an existing directory.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const directory = await workos.directorySync.getDirectory(
  'directory_01ECAZ4NV9QMV47GW873HDCX74',
);
```

### directorySync.getDirectory()

### Parameters

- `id`: `string`

### Returns

## Directory

## List Directories

Get a list of all of your existing directories matching the criteria specified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const directoryList = await workos.directorySync.listDirectories();

console.log(directoryList.data);
```

### directorySync.listDirectories()

### Parameters object

- `organizationId?`: `string`

- `search?`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `Directory[]`

- `listMetadata`: `object`

## Delete a Directory

Permanently deletes an existing directory. It cannot be undone.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.directorySync.deleteDirectory(
  'directory_01ECAZ4NV9QMV47GW873HDCX74',
);
```

### directorySync.deleteDirectory()

### Parameters

- `id`: `string`

## Directory User

A Directory User represents an active organization user.

Developers can receive Webhooks as employees are added, updated or removed, allowing for provisioning and de-provisioning Users within an application.

### Example Directory User

```javascript
const user = {
  id: 'directory_user_01E1JG7J09H96KYP8HM9B0G5SJ',
  idpId: '2836',
  directoryId: 'directory_01ECAZ4NV9QMV47GW873HDCX74',
  organizationId: 'org_01EZTR6WYX1A0DSE2CYMGXQ24Y',
  firstName: 'Marcelina',
  lastName: 'Davis',
  emails: [
    {
      primary: true,
      type: 'work',
      value: 'marcelina@example.com',
    },
  ],
  username: 'marcelina@example.com',
  groups: [
    {
      id: 'directory_group_01E64QTDNS0EGJ0FMCVY9BWGZT',
      name: 'Engineering',
      createdAt: '2021-06-25T19:07:33.155Z',
      updatedAt: '2021-06-25T19:07:33.155Z',
      rawAttributes: {},
    },
  ],
  state: 'active',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
  customAttributes: {
    department: 'Engineering',
    jobTitle: 'Software Engineer',
  },
  rawAttributes: {},
  role: { slug: 'member' },
};
```

#### `interface DirectoryUser`

- `id`: `string`

- `idpId`: `string`

- `directoryId`: `string`

- `organizationId?`: `string`

- `firstName?`: `string`

- `lastName?`: `string`

- `email?`: `string`

- `groups`: `DirectoryGroup[]`

- `state`: `string`

- `customAttributes`: `object`

rawAttributes [Deprecated]: object

- `role?`: `object`

## Get a Directory User

Get the details of an existing Directory User.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const user = await workos.directorySync.getUser(
  'directory_user_01E64QS50EAY48S0XJ1AA4WX4D',
);
```

### directorySync.getUser()

### Parameters

- `id`: `string`

### Returns

DirectoryUser

## List Directory Users

Get a list of all of existing Directory Users matching the criteria specified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const users = await workos.directorySync.listUsers({
  directory: 'directory_01ECAZ4NV9QMV47GW873HDCX74',
});

console.log(users.data);
```

### directorySync.listUsers()

### Parameters object

- `directory?`: `string`

- `group?`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `DirectoryUser[]`

- `listMetadata`: `object`

## Directory Group

A directory group represents an organizational unit of users in a directory provider.

### Example Directory Group

```javascript
const group = {
  id: 'directory_group_01E64QTDNS0EGJ0FMCVY9BWGZT',
  idpId: '02grqrue4294w24',
  directoryId: 'directory_01ECAZ4NV9QMV47GW873HDCX74',
  organizationId: 'org_01EZTR6WYX1A0DSE2CYMGXQ24Y',
  name: 'Developers',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
  rawAttributes: {},
};
```

#### `interface DirectoryGroup`

- `id`: `string`

- `idpId`: `string`

- `directoryId`: `string`

- `organizationId?`: `string`

- `name`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `rawAttributes`: `object`

## Get a Directory Group

Get the details of an existing Directory Group.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const group = await workos.directorySync.getGroup(
  'directory_group_01E64QTDNS0EGJ0FMCVY9BWGZT',
);
```

### directorySync.getGroup()

### Parameters

- `id`: `string`

### Returns

DirectoryGroup

## List Directory Groups

Get a list of all of existing directory groups matching the criteria specified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const groups = await workos.directorySync.listGroups({
  directory: 'directory_01ECAZ4NV9QMV47GW873HDCX74',
});

console.log(groups.data);
```

### directorySync.listGroups()

### Parameters object

- `directory?`: `string`

- `user?`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `DirectoryGroup[]`

- `listMetadata`: `object`

Organization domain
An organization domain represents an organization’s domain. Domains can be verified to assert that an organization owns the configured domain which is accomplished through DNS TXT record verification.

To automatically respond to changes in the organization domains, use organization domain events.

### Example organization domain

```javascript
const organization_domain = {
  object: 'organization_domain',
  id: 'org_domain_01HE8GSH9BC1T08J2A9K6TDERK',
  organizationId: 'org_01HE8GSH8FQPASKSY27THRKRBP',
  domain: 'foo-corp.com',
  state: 'verified',
  verificationStrategy: 'dns',
  verificationToken: 'm5Oztg3jdK4NJLgs8uIlIprMw',
};
```

#### `interface OrganizationDomain`

- `object`: `"organization_domain"`

- `id`: `string`

- `organizationId`: `string`

- `domain`: `string`

- `state`: `"pending" | "verified" | "failed"`

- `verificationStrategy`: `"dns" | "manual"`

- `verificationToken`: `string`

## Get an Organization Domain

Get the details of an existing organization.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organization = await workos.organizationDomains.get(
  'org_domain_01HEJXJSTVEDT7T58BM70FMFET',
);
```

### organizationDomains.get()

### Parameters

- `id`: `string`

### Returns

OrganizationDomain

## Create an Organization Domain

Creates a new Organization Domain.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organization = await workos.organizationDomains.create({
  organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
  domain: 'foo-corp.com',
});
```

### organizationDomains.create()

### Parameters

- `organizationId`: `string`

- `domain`: `string`

### Returns

OrganizationDomain

## Verify an Organization Domain

Initiates verification process for an Organization Domain.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organization = await workos.organizationDomains.verify(
  'org_domain_01HEJXJSTVEDT7T58BM70FMFET',
);
```

### organizationDomains.verify()

### Parameters

- `id`: `string`

### Returns

OrganizationDomain

# Events

Events represent activity that has occurred within WorkOS or within third-party identity and directory providers. They are used to keep your app in sync with WorkOS data. For more details on consuming events in your app, check out the data syncing guide.

Refer to the Events page for a full list of events that WorkOS emits.

## List events

Get a list of all of events up to 30 days old.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

const listOfEvents = await workos.events.listEvents({
  events: [
    'dsync.activated',
    'dsync.deleted',
    'dsync.user.created',
    'dsync.user.updated',
    'dsync.user.deleted',
  ],
});
```

### events.listEvents()

### Parameters

- `events`: `EventNames[]`

- `limit?`: `number`

- `organizationId?`: `string`

- `rangeStart?`: `string`

- `rangeEnd?`: `string`

- `after?`: `string`

### Returns object

- `data`: `Event[]`

- `listMetadata`: `object`

# Feature Flags

Feature flags allow you to control feature availability for organizations in your application. Flags can either be enabled for individual organizations or all organizations in an environment. Read more about how feature flags integrate with AuthKit here.

### Example Feature Flag

```javascript
const featureFlag = {
  object: 'feature_flag',
  id: 'flag_01EHZNVPK3SFK441A1RGBFSHRT',
  name: 'Advanced Analytics',
  slug: 'advanced-analytics',
  description: 'Enable advanced analytics dashboard feature',
  createdAt: '2025-08-04T19:07:33.155Z',
  updatedAt: '2025-08-04T19:07:33.155Z',
};
```

#### `interface FeatureFlag`

- `object`: `"feature_flag"`

- `id`: `string`

- `name`: `string`

- `slug`: `string`

- `description`: `string | null`

- `createdAt`: `string`

- `updatedAt`: `string`

## Get a feature flag

Get the details of an existing feature flag.

```bash
curl https://api.workos.com/feature-flags/advanced-analytics \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

/feature-flags/:slug

### Parameters

- `slug`: `string`

### Returns

feature_flag

## List feature flags

Get a list of all of your existing feature flags matching the criteria specified.

```bash
curl https://api.workos.com/feature-flags \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

/feature-flags

### Parameters

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `array`

- `list_metadata`: `object`

## List feature flags for an organization

Get a list of all enabled feature flags for the provided organization.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const featureFlags = await workos.organizations.listOrganizationFeatureFlags({
  organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
});

console.log(featureFlags.data);
```

### organizations.listOrganizationFeatureFlags()

### Parameters object

- `organizationId`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `FeatureFlag[]`

- `listMetadata`: `object`

## List feature flags for a user

Get a list of all enabled feature flags for the provided user. This includes feature flags enabled specifically for the user as well as any organizations that the user is a member of.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const featureFlags = await workos.userManagement.listUserFeatureFlags({
  userId: 'user_01EHZNVPK3SFK441A1RGBFSHRT',
});

console.log(featureFlags.data);
```

### userManagement.listUserFeatureFlags()

### Parameters object

- `userId`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `FeatureFlag[]`

- `listMetadata`: `object`

## Add flag target

Enables a feature flag for a specific target in the current environment. Currently, supported targets include users and organizations.

### Request

```bash
curl --request POST \
  --url https://api.workos.com/feature-flags/test-flag/targets/org_01EHZNVPK3SFK441A1RGBFSHRT \
  --header "Authorization: Bearer sk_example_123456789"
```

**POST**

/feature-flags/:slug/targets/:target_id

### Parameters

- `slug`: `string`

- `target_id`: `string`

## Remove flag target

Removes a target from the feature flag’s target list in the current environment. Currently, supported targets include users and organizations.

### Request

```bash
curl --request DELETE \
  --url https://api.workos.com/feature-flags/test-flag/targets/org_01EHZNVPK3SFK441A1RGBFSHRT \
  --header "Authorization: Bearer sk_example_123456789"
```

**DELETE**

/feature-flags/:slug/targets/:target_id

### Parameters

- `slug`: `string`

- `target_id`: `string`

## Enable flag

Enables a feature flag in the current environment.

```bash
curl --request PUT \
  --url https://api.workos.com/feature-flags/advanced-analytics/enable \
  --header "Authorization: Bearer sk_example_123456789"
```

**PUT**

/feature-flags/:slug/enable

### Parameters

- `slug`: `string`

### Returns

feature_flag

## Disable flag

Disables a feature flag in the current environment.

```bash
curl --request PUT \
  --url https://api.workos.com/feature-flags/advanced-analytics/disable \
  --header "Authorization: Bearer sk_example_123456789"
```

**PUT**

/feature-flags/:slug/disable

### Parameters

- `slug`: `string`

### Returns

feature_flag

## Authentication Factor

An object representing an Authentication Factor.

### Example Authentication Factor

```javascript
const factor = {
  object: 'authentication_factor',
  id: 'auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ',
  createdAt: '2022-02-15T15:14:19.392Z',
  updatedAt: '2022-02-15T15:14:19.392Z',
  type: 'totp',
  totp: {
    qrCode: 'data:image/png;base64,{base64EncodedPng}',
    secret: 'NAGCCFS3EYRB422HNAKAKY3XDUORMSRF',
    uri: 'otpauth://totp/FooCorp:alan.turing@example.com?secret=NAGCCFS3EYRB422HNAKAKY3XDUORMSRF&issuer=FooCorp',
  },
};
```

#### `interface Factor`

- `object`: `"authentication_factor"`

- `id`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `type`: `"totp"`

- `totp`: `object`

- `issuer`: `string`

- `user`: `string`

- `qrCode`: `string`

- `secret`: `string`

- `uri`: `string`

- `userId`: `string`

## Authentication Challenge

An object representing a Challenge of an Authentication Factor.

### Example Authentication Challenge

```javascript
const challenge = {
  object: 'authentication_challenge',
  id: 'auth_challenge_01FVYZWQTZQ5VB6BC5MPG2EYC5',
  createdAt: '2022-02-15T15:26:53.274Z',
  updatedAt: '2022-02-15T15:26:53.274Z',
  expiresAt: '2022-02-15T15:36:53.279Z',
  authenticationFactorId: 'auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ',
};
```

#### `interface Challenge`

- `object`: `"authentication_challenge"`

- `id`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `expiresAt`: `string`

- `authenticationFactorId`: `string`

## Enroll Factor

Enrolls an Authentication Factor to be used as an additional factor of authentication. The returned ID should be used to create an authentication Challenge.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const factor = await workos.mfa.enrollFactor({
  type: 'totp',
  issuer: 'Foo Corp',
  user: 'alan.turing@example.com',
});
```

### mfa.enrollFactor()

### Parameters object

- `type`: `"totp" | "sms"`

- `issuer`: `string`

- `user`: `string`

- `phoneNumber`: `string`

### Returns

Factor

## Challenge Factor

Creates a Challenge for an Authentication Factor.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const challenge = await workos.mfa.challengeFactor({
  authenticationFactorId: 'auth_factor_01FZ4TS14D1PHFNZ9GF6YD8M1F',
  smsTemplate: 'Your code is {{code}}',
});
```

### mfa.challengeFactor()

### Parameters object

- `authenticationFactorId`: `string`

- `smsTemplate?`: `string`

### Returns

Challenge

## Verify Challenge

Verify Authentication Challenge.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { challenge, valid } = await workos.mfa.verifyChallenge({
  authenticationChallengeId: 'auth_challenge_01FVYZWQTZQ5VB6BC5MPG2EYC5',
  code: '123456',
});
```

### mfa.verifyChallenge()

### Parameters object

- `authenticationChallengeId`: `string`

- `code`: `string`

### Returns object

- `challenge`: `Challenge`

- `valid`: `boolean`

## Get Factor

Gets an Authentication Factor.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const factor = await workos.mfa.getFactor(
  'auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ',
);
```

### mfa.getFactor()

### Parameters

- `id`: `string`

### Returns

Factor

## Delete Factor

Permanently deletes an Authentication Factor. It cannot be undone.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.mfa.deleteFactor('auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ');
```

### mfa.deleteFactor()

### Parameters

- `id`: `string`

# Organization

An Organization is a top-level resource in WorkOS. Each Connection, Directory, and Audit Trail Event belongs to an Organization. An Organization will usually represent one of your customers. There is no limit to the number of organizations you can create in WorkOS.

### Example Organization

```javascript
const organization = {
  object: 'organization',
  id: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  name: 'Foo Corp',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
  domains: [
    {
      id: 'org_domain_01EHZNVPK2QXHMVWCEDQEKY69A',
      object: 'organization_domain',
      domain: 'foo-corp.com',
    },
  ],
  stripeCustomerId: 'cus_R9qWAGMQ6nGE7V',
  externalId: '2fe01467-f7ea-4dd2-8b79-c2b4f56d0191',
};
```

#### `interface Organization`

- `object`: `"organization"`

- `id`: `string`

- `name`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `domains`: `OrganizationDomain[]`

- `stripeCustomerId?`: `string`

- `externalId?`: `string`

- `metadata?`: `object`

## Get an Organization

Get the details of an existing organization.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organization = await workos.organizations.getOrganization(
  'org_01EHZNVPK3SFK441A1RGBFSHRT',
);
```

### organizations.getOrganization()

### Parameters

- `id`: `string`

### Returns

# Organization

## Get an Organization by External ID

Get the details of an existing organization by an external identifier.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organization = await workos.organizations.getOrganizationByExternalId(
  '2fe01467-f7ea-4dd2-8b79-c2b4f56d0191',
);
```

### organizations.getOrganizationByExternalId()

### Parameters

- `externalId`: `string`

### Returns

# Organization

## List Organizations

Get a list of all of your existing organizations matching the criteria specified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organizations = await workos.organizations.listOrganizations({
  domains: ['foo-corp.com'],
});

console.log(organizations.data);
```

### organizations.listOrganizations()

### Parameters object

- `domains?`: `string[]`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `Organization[]`

- `listMetadata`: `object`

## Create an Organization

Creates a new organization in the current environment.

You can include one or more domains to associate with the organization, but you should verify the ownership of every domain before setting its state to verified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organization = await workos.organizations.createOrganization({
  name: 'Foo Corp',
  domainData: [
    {
      domain: 'foo-corp.com',
      state: 'pending',
    },
  ],
  externalId: '2fe01467-f7ea-4dd2-8b79-c2b4f56d0191',
  metadata: {
    tier: 'diamond',
  },
});
```

### organizations.createOrganization()

### Parameters object

- `name`: `string`

- `domainData?`: `object[]`

- `externalId?`: `string`

- `metadata?`: `object`

### Returns

# Organization

## Update an Organization

Updates an organization in the current environment.

You can include one or more domains to associate with the organization, but you should verify the ownership of every domain before setting its state to verified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const organization = await workos.organizations.updateOrganization({
  organization: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  name: 'Foo Corp',
  domainData: [
    {
      domain: 'foo-corp.com',
      state: 'verified',
    },
  ],
  externalId: '2fe01467-f7ea-4dd2-8b79-c2b4f56d0191',
  metadata: {
    tier: 'diamond',
  },
  stripeCustomerId: 'cus_R9qWAGMQ6nGE7V',
});
```

### organizations.updateOrganization()

### Parameters object

- `organization`: `string`

- `name`: `string`

- `domainData?`: `object[]`

- `stripeCustomerId?`: `string`

- `externalId?`: `string`

- `metadata?`: `object`

### Returns

# Organization

## Delete an Organization

Permanently deletes an organization in the current environment. It cannot be undone.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.organizations.deleteOrganization('org_01EHZNVPK3SFK441A1RGBFSHRT');
```

### organizations.deleteOrganization()

### Parameters

- `id`: `string`

## Organization Domain

An Organization Domain (also known as a User Email Domain) represents an Organization’s domain.

These domains restrict which email addresses are able to sign in through SAML Connections when allow profiles outside organization is false. This is the default behavior for Organizations. See SSO frequently asked questions for more details on this behavior.

Organization domains can be verified manually (through the API or the Dashboard), or through a self-serve flow through the Admin Portal. The organization that defines this domain policy exerts authentication policy control over that domain across your application. For this reason, it is important to verify ownership of manually added domains. Additionally, WorkOS does not allow addition of common consumer domains, like gmail.com.

### Example Organization Domain

```javascript
const organizationDomain = {
  object: 'organization_domain',
  id: 'org_01EHZNVPK3SFK441A1RGBFSVCT',
  organizationId: 'org_01HE8GSH8FQPASKSY27THRKRBP',
  domain: 'foo-corp.com',
  state: 'verified',
  verificationStrategy: 'dns',
  verificationToken: 'm5Oztg3jdK4NJLgs8uIlIprMw',
};
```

#### `interface OrganizationDomain`

- `object`: `"organization_domain"`

- `id`: `string`

- `domain`: `string`

# Pipes

Pipes provides OAuth integrations with third-party providers that allow your users to securely connect their accounts to your application. Pipes handles the complete OAuth lifecycle including token refresh and credential storage.

Read more in the Pipes guide.

## Get an access token for a connected account

Fetches a valid OAuth access token for a user’s connected account. WorkOS automatically handles token refresh, ensuring you always receive a valid, non-expired token.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const token = await workos.pipes.getAccessToken({
  userId: 'user_01EHZNVPK3SFK441A1RGBFSHRT',
  organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  provider: 'github',
});
```

### pipes.getAccessToken()

### Parameters object

- `provider`: `string`

- `userId`: `string`

- `organizationId?`: `string`

### Returns

- `accessToken`: `object | null`

- `error?`: `"not_installed" | "needs_reauthorization"`

# Radar

Radar allows you to detect, verify, and block harmful behavior in real time. The Radar API supports the management of WorkOS Radar block and allow lists as well as standalone Radar use-cases. While Radar is natively integrated with AuthKit, you can also leverage Radar’s risk decisioning engine outside of AuthKit to detect fraudulent sign-in and signup attempts in your own custom authentication flows using the attempts API.

The Radar standalone API is currently in preview,
contact us
to request access.

## Attempts

A Radar attempt represents a sign-in or signup attempt and includes context such as IP address and user agent. The Radar engine assesses attempts for risk and returns a decision that you can use to drive behavior in your application.

## Create an Attempt

Evaluates an authentication attempt based on the parameters provided and returns a verdict.

```bash
curl https://api.workos.com/radar/attempts \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "email": "test@example.com",
    "auth_method": "Password",
    "action": "signup"
  }'
```

**POST**

`/radar/attempts`

- `ip_address`: `string`

- `user_agent`: `string`

- `email`: `string`

- `auth_method`: `"Password" | "Passkey" | "Authenticator" | "SMS_OTP" | "Email_OTP" | "Social" | "SSO" | "Other"`

action: "sign-up" | "sign-in"

### Returns

- `verdict`: `"allow" | "block" | "challenge"`

- `reason`: `string`

- `attempt_id`: `string`

- `control?`: `"bot_detection" | "brute_force_attack" | "credential_stuffing" | "domain_sign_up_rate_limit" | "ip_sign_up_rate_limit" | "impossible_travel" | "repeat_sign_up" | "stale_account" | "unrecognized_device" | "restriction"`

- `blocklist_type?`: `"ip_address" | "domain" | "email" | "device" | "user_agent" | "device_fingerprint"`

## Update an Attempt

You may optionally inform Radar that an authentication attempt or challenge was successful using this endpoint. Some Radar controls depend on tracking recent successful attempts, such as impossible travel.

```bash
curl https://api.workos.com/radar/attempts/01E4ZCR3C56J083X43JQXF3JK5 \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  --request PUT \
  --data '{
    "attempt_status": "success"
  }'
```

**PUT**

`/radar/attempts/:id`

- `challenge_status`: `"success"`

- `attempt_status`: `"success"`

### Parameters

- `id`: `string`

## Radar lists

Radar supports explicitly blocking and allowing attempts based on attempt attributes. You can manage these lists via the Radar list management APIs

## Add Entry

Adds an entry to a Radar list

```bash
curl https://api.workos.com/radar/lists/ip_address/block \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{
    "entry": "49.78.240.97"
  }'
```

**POST**

`/radar/lists/:type/:action`

- `entry`: `string`

### Parameters

- `type`: `"ip_address" | "domain" | "email" | "device" | "user_agent" | "device_fingerprint"`

- `action`: `"block" | "allow"`

## Remove Entry

Removes an entry from a Radar list

```bash
curl https://api.workos.com/radar/lists/ip_address/block \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  --request DELETE \
  --data '{
    "entry": "49.78.240.97"
  }'
```

**DELETE**

`/radar/lists/:type/:action`

- `entry`: `string`

### Parameters

- `type`: `"ip_address" | "domain" | "email" | "device" | "user_agent" | "device_fingerprint"`

- `action`: `"block" | "allow"`

# Roles

A role is an access control resource that can be assigned to organization memberships, directory users, and SSO profiles.

### Example Role

```javascript
const role = {
  object: 'role',
  id: 'role_01EHZNVPK3SFK441A1RGBFSHRT',
  name: 'Member',
  slug: 'member',
  description: 'Access to basic resources',
  permissions: ['posts:read', 'posts:write'],
  type: 'EnvironmentRole',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
};
```

#### `interface Role`

- `object`: `"role"`

- `id`: `string`

- `name`: `string`

- `slug`: `string`

- `description`: `string | null`

- `permissions`: `string[]`

- `type`: `"EnvironmentRole" | "OrganizationRole"`

- `createdAt`: `string`

- `updatedAt`: `string`

## List roles for an organization

Get a list of all roles for the provided organization in priority order. Includes all environment and organization roles.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const roles = await workos.organizations.listOrganizationRoles({
  organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
});

console.log(roles.data);
```

### organizations.listOrganizationRoles()

### Returns object

- `data`: `Role[]`

# Single Sign-On

The Single Sign-On API has been modeled to meet the OAuth 2.0 framework specification. As a result, authentication flows constructed using the Single Sign-On API replicate the OAuth 2.0 protocol flow.

To automatically respond to changes in your SSO connections, use the Connection events.

## Get an authorization URL

Generates an OAuth 2.0 authorization URL to authenticate a user with SSO.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const authorizationUrl = workos.sso.getAuthorizationUrl({
  connection: 'conn_01E4ZCR3C56J083X43JQXF3JK5',
  clientId: 'client_123456789',
  redirectUri: 'https://your-app.com/callback',
  state: 'dj1kUXc0dzlXZ1hjUQ==',
});
```

### sso.getAuthorizationUrl()

### Parameters object

- `redirectUri`: `string`

- `clientId`: `string`

- `connection?`: `string`

- `organization?`: `string`

- `provider?`: `"AppleOAuth" | "GitHubOAuth" | "GoogleOAuth" | "MicrosoftOAuth"`

- `state?`: `string`

- `loginHint?`: `string`

- `domainHint?`: `string`

- `providerScopes?`: `string`

- `providerQueryParams?`: `object`

### Returns

- `url`: `string`

You’ll have to specify the user’s connection, organization, or OAuth provider as a parameter. These connection selectors are mutually exclusive, and exactly one must be provided. The generated URL automatically directs the user to their identity provider. Once the user authenticates with their identity provider, WorkOS then issues a redirect to your redirect URI to complete the sign-in flow.

## Redirect URI

In the OAuth 2.0 protocol, a redirect URI is the location that the user is redirected to once they have successfully authenticated with their identity provider.

When redirecting the user, WorkOS will generate an authorization code and pass it to your redirect URI as a code query parameter, your app will use this code to get the user’s profile. Additionally, WorkOS can pass a state parameter back to your application that you may use to encode arbitrary information to restore your application state between the redirects.

Redirect URI with query parameters
`https://your-app.com/callback?code=01E2RJ4C05B52KKZ8FSRDAP23J&state=dj1kUXc0dzlXZ1hjUQ==`
You’ll need to configure the allowed redirect URIs for your application via the
Redirects
page in the dashboard. Without a valid redirect URI, your users will be unable to sign in. Make sure that the redirect URI you use as a parameter to get the authorization URL matches one of the redirect URIs you have configured in the dashboard.

Redirect URIs follow stricter requirements in production environments:

HTTPS protocol is required in production environments
HTTP and localhost are allowed in staging environments
Wildcard characters are not allowed in production environments

## Wildcards

WorkOS supports using wildcard characters in Redirect URIs. The * symbol can be used as a wildcard for subdomains; however, it must be used in accordance with the following rules in order to properly function.

The wildcard must be located in a subdomain within the hostname component. For example, `http://*.com` will not work.
The wildcard must be located in the subdomain which is furthest from the root domain. For example, `https://sub.*.example.com` will not work.
The URL must not contain more than one wildcard. For example, `https://*.*.example.com` will not work.
A wildcard character may be prefixed and/or suffixed with additional valid hostname characters. For example, `https://prefix-*-suffix.example.com` will work.
A URL with a valid wildcard will not match a URL more than one subdomain level in place of the wildcard. For example, `https://*.example.com` will not work with `https://sub1.sub2.example.com.`
In production environments, wildcards cannot be used with
public suffix domains
. For example, `https://*.ngrok-free.app` will not work.
The wildcard will match a sequence of letters (A through Z, and a through z ); digits (0 through 9), hyphens (-), and underscores (_). For example, `https://user:secret@foo.example.com` will not work with `https://*.example.com.`
A URL with a wildcard cannot be set as the default redirect URI.

## Error codes

If there is an issue generating an authorization URL, the API will return the original redirect URI with error and error_description query parameters. If provided, the state value will also be included.

Redirect URI with an error code
`https://your-app.com/callback?error=organization_invalid&error_description=No%20connection%20associated%20with%20organization&state=123456789`
Possible error codes and the corresponding descriptions are listed below.

| Error code | Description |
|---|---|
| access_denied | The identity provider denied the user’s access to the client application, or the user declined the OAuth authorization request at the identity provider. |
| ambiguous_connection_selector | A connection could not be uniquely identified using the provided connection selector (e.g., organization). This can occur when there are multiple SSO connections under the same organization. If you need multiple SSO connections for an organization, use the connection parameter to identify which connection to use for SSO. |
| connection_domain_invalid | There is no connection for the provided domain. |
| connection_invalid | There is no connection for the provided ID. |
| connection_strategy_invalid | The provider has multiple strategies associated per environment. |
| connection_unlinked | The connection associated with the request is unlinked. |
| domain_connection_selector_not_allowed | This is a legacy error code that only applies if using the deprecated “domain” query parameter which is no longer valid for this endpoint. Use the “organization” or “connection” query parameters to target a connection instead. |
| idp_initiated_sso_disabled | IdP-initiated SSO is disabled for the connection (see Disable IdP-initiated SSO). |
| invalid_connection_selector | A valid connection selector query parameter must be provided in order to correctly determine the proper connection to return an authorization URL for. Valid connection selectors are either connection, organization, or provider. |
| organization_invalid | There is no organization matching the provided ID. |
| oauth_failed | An OAuth authorization request failed for a user. |
| profile_not_allowed_outside_organization | A profile was received that has an email that is outside the organization’s domain and the organization does not allow this. To resolve this, add the missing domain to the organization’s Domains. You can read about other options in the SSO Domains guide. |
| server_error | The SSO authentication failed for the user. More detailed errors and steps to resolve are available in the Sessions tab on the connection page in the WorkOS Dashboard. |
| signin_consent_denied | The user rejected the sign-in consent screen. This screen prompts the user to verify the email provided by the identity provider to confirm the legitimacy of the sign-in attempt. |

# Profile

A Profile is an object that represents an authenticated user. The Profile object contains information relevant to a user in the form of normalized attributes.

After receiving the Profile for an authenticated user, use the Profile object attributes to persist relevant data to your application’s user model for the specific, authenticated user.

To surface additional attributes on the Profile, refer to the SSO custom attributes guide.

### Example Profile

```javascript
const profile = {
  id: 'prof_01DMC79VCBZ0NY2099737PSVF1',
  connectionId: 'conn_01E4ZCR3C56J083X43JQXF3JK5',
  organizationId: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
  connectionType: 'OktaSAML',
  email: 'todd@example.com',
  firstName: 'Todd',
  idpId: '00u1a0ufowBJlzPlk357',
  lastName: 'Rundgren',
  role: { slug: 'admin' },
  customAttributes: {
    department: 'Engineering',
    jobTitle: 'Software Engineer',
  },
  object: 'profile',
  rawAttributes: {},
};
```

#### `interface Profile`

- `id`: `string`

- `connectionId`: `string`

- `connectionType`: `string`

- `organizationId?`: `string`

- `email`: `string`

- `firstName`: `string`

- `lastName`: `string`

- `idpId`: `string`

- `role`: `object`

- `customAttributes`: `object`

rawAttributes [Deprecated]: object

## Get a Profile and Token

Get an access token along with the user Profile using the code passed to your Redirect URI.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { access_token, profile, oauth_tokens } =
  await workos.sso.getProfileAndToken({
    code: '01DMEK0J53CVMC32CK5SE0KZ8Q',
    clientId: 'client_123456789',
  });
```

### sso.getProfileAndToken()

### Parameters object

- `clientId`: `string`

- `code`: `string`

### Returns object

- `accessToken`: `string`

- `profile`: `Profile`

- `oauthTokens?`: `object`

## Get a User Profile

Exchange an access token for a user’s Profile. Because this profile is returned in the Get a Profile and Token endpoint your application usually does not need to call this endpoint. It is available for any authentication flows that require an additional endpoint to retrieve a user’s profile.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const profile = await workos.sso.getProfile({
  accessToken: '01DMEK0J53CVMC32CK5SE0KZ8Q',
});
```

### sso.getProfile()

### Parameters object

- `accessToken`: `string`

### Returns

# Profile

# Connection

A connection represents the relationship between WorkOS and any collection of application users. This collection of application users may include personal or enterprise identity providers. As a layer of abstraction, a WorkOS connection rests between an application and its users, separating an application from the implementation details required by specific standards like OAuth 2.0 and SAML.

See the events reference documentation for the connection events.

### Example Connection

```javascript
const connection = {
  id: 'conn_01E4ZCR3C56J083X43JQXF3JK5',
  organizationId: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
  type: 'OktaSAML',
  name: 'Foo Corp',
  state: 'active',
  createdAt: '2021-06-25T19:07:33.155Z',
  updatedAt: '2021-06-25T19:07:33.155Z',
  domains: [
    {
      id: 'org_domain_01EHZNVPK2QXHMVWCEDQEKY69A',
      object: 'connection_domain',
      domain: 'foo-corp.com',
    },
  ],
};
```

#### `interface Connection`

- `id`: `string`

- `organizationId?`: `string`

- `type?`: `string`

- `name`: `string`

- `state`: `string`

- `createdAt`: `string`

- `updatedAt`: `string`

- `domains`: `OrganizationDomain[]`

## Get a Connection

Get the details of an existing connection.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const connection = await workos.sso.getConnection(
  'conn_01E4ZCR3C56J083X43JQXF3JK5',
);
```

### sso.getConnection()

### Parameters

- `id`: `string`

### Returns

# Connection

## List Connections

Get a list of all of your existing connections matching the criteria specified.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const connectionList = await workos.sso.listConnections();

console.log(connectionList.data);
```

### sso.listConnections()

### Parameters object

- `connectionType?`: `string`

- `domain?`: `string`

- `organizationId?`: `string`

- `after?`: `string`

- `before?`: `string`

- `limit?`: `number`

- `order?`: `"asc" | "desc"`

### Returns object

- `data`: `Connection[]`

- `listMetadata`: `object`

## Delete a Connection

Permanently deletes an existing connection. It cannot be undone.

### Request

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.sso.deleteConnection('conn_01E2NPPCT7XQ2MVVYDHWGK1WN4');
```

### sso.deleteConnection()

### Parameters

- `id`: `string`

# Logout

The Logout endpoints enable the RP-initiated logout functionality for users in your application. Refer to Single Logout section for more details on how to handle RP-initiated or IdP-initiated logout.

Please note that the Logout feature is only available for Custom Open ID connections that provide specific logout features. These features include the presence of the revocation_endpoint and end_session_endpoint in the discovery document.

Logout Authorize
You should call this endpoint from your server to generate a logout token which is required for the Logout Redirect endpoint.

```bash
curl --request POST \
  --url https://auth.workos.com/sso/logout/authorize \
  --header "Authorization: Bearer sk_example_123456789" \
  -d profile_id="prof_01GWQ1G0H2FM6ASEF0HS13HCW9304kg03g"
```

**POST**

`/sso/logout/authorize`

### Parameters

- `profile_id`: `string`

### Returns object

- `logout_url`: `string`

- `logout_token`: `string`

Logout Redirect
Logout allows to sign out a user from your application by triggering the identity provider sign out flow. This GET endpoint should be a redirection, since the identity provider user will be identified in the browser session.

Before redirecting to this endpoint, you need to generate a short-lived logout token using the Logout Authorize endpoint.

```bash
curl --request GET \
  --url https://auth.workos.com/sso/logout? \
  token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlX2lkIjoicHJvZl8wMUdXUTFHMEgyRk02QVNFRjBIUzEzSENXOS0zMDRrZzAzZyIsImV4cCI6IjE1MTYyMzkwMjIifQ.Wru9Qlnf5DpohtGCKhZU4cVOd3zpiu7QQ-XEX--5A_4
```

**GET**

`/sso/logout`

### Parameters

- `token`: `string`

# Vault

Vault provides centralized encryption and storage of sensitive data such as API keys, database credentials, or personally identifiable information (PII). All data is encrypted using keys automatically provisioned based on the provided context of the object.

## Encrypted Object

Represents an encrypted object stored by Vault.

Object

```javascript
const object = {
  id: 'secret_51B0AC67C2FB4247AC5ABDDD3C701BDC',
  metadata: {
    id: 'secret_51B0AC67C2FB4247AC5ABDDD3C701BDC',
    environmentId: 'environment_example_23456789',
    context: {
      organization_id: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
    },
    keyId: 'e2084ada-50c1-5f9a-b1c7-fa868d506e5a',
    updatedAt: '2025-02-21T12:04:09.165291Z',
    updatedBy: {
      id: 'user_01E4ZCR3C56J083X43JQXF3JK5',
      name: 'Marcelina Davis',
    },
    versionId: 'Wq49AmJIR7QI0kSwfY9BZ6vNsOq6AO_X',
  },
  name: 'secret-name',
  value: 'my secret value',
};
```

#### `interface Object`

- `id`: `string`

- `name`: `string`

- `value`: `string`

- `metadata`: `object`

- `id`: `string`

- `environmentId`: `string`

- `context`: `object`

- `keyId`: `string`

- `updatedAt`: `string`

- `updatedBy`: `object`

- `id`: `string`

- `name`: `string`

- `versionId`: `string`

## Create an object

Create a new object, encrypted with the key(s) matching the provided key context.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.createObject({
  name: 'secret-name',
  value: 'my secret value',
  context: { organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT' },
});
```

### vault.createObject()

### Parameters object

- `name`: `string`

- `value`: `string`

- `context`: `object`

### Returns

- `metadata`: `object`

- `id`: `string`

- `environmentId`: `string`

- `context`: `object`

- `keyId`: `string`

- `updatedAt`: `string`

- `updatedBy`: `object`

- `id`: `string`

- `name`: `string`

- `versionId`: `string`

## Get an object

Get an existing object. The stored value will be decrypted and returned.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.readObject({
  id: 'secret_51B0AC67C2FB4247AC5ABDDD3C701BDC',
});
```

### vault.readObject()

### Parameters object

- `id`: `string`

### Returns

Object

## Get an object by name

Get an existing object by its name. The stored value will be decrypted and returned.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.readObjectByName('my-secret-name');
```

### vault.readObjectByName()

### Parameters

- `name`: `string`

### Returns

Object

## Update an object value

Update the value for an object. The key context of the original object will be used to encrypt the new data.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.updateObject({
  id: 'secret_51B0AC67C2FB4247AC5ABDDD3C701BDC',
  value: 'new value',
  versionCheck: 'Wq49AmJIR7QI0kSwfY9BZ6vNsOq6AO_X',
});
```

### vault.updateObject()

### Parameters object

- `id`: `string`

- `value`: `string`

- `versionCheck?`: `string`

### Returns

Object
Retrieve metadata
Retrieve metadata about an object. The value itself is not returned.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.describeObject({
  id: 'secret_51B0AC67C2FB4247AC5ABDDD3C701BDC',
});
```

### vault.describeObject()

### Parameters object

- `id`: `string`

### Returns

Object

## List objects

Get list of object names stored in Vault.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.listObjects();
```

### vault.listObjects()

### Parameters object

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

### Returns object

- `data`: `array`

- `listMetadata`: `object`

## Delete an object

Permanently delete an object.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.deleteObject({
  id: 'secret_51B0AC67C2FB4247AC5ABDDD3C701BDC',
});
```

### vault.deleteObject()

### Parameters object

- `id`: `string`

- `version_check?`: `string`

### Returns

- `success`: `boolean`

- `name`: `string`

## Object Version

Represents a static version of an object stored by Vault.

## Object Version

```javascript
const objectVersion = {
  createdAt: '2025-02-21T12:04:09.165291Z',
  currentVersion: true,
  etag: '"62b747b941ceefd67dacc026724044e4"',
  id: 'Wq49AmJIR7QI0kSwfY9BZ6vNsOq6AO_X',
  size: 271,
};
List object versions
Get list of versions for an object stored in Vault.

import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.listObjectVersions({
  id: 'secret_51B0AC67C2FB4247AC5ABDDD3C701BDC',
});
```

### vault.listObjectVersions()

### Parameters object

- `id`: `string`

### Returns object

- `data`: `ObjectVersion[]`

- `listMetadata`: `object`

## Encryption Key Management

The key management APIs can be used to generate isolated encryption keys for local encryption and decryption operations.

## Create a data key

Generate a data key for local encryption based on the provided key context.

The encrypted data key MUST be stored by the application, as it cannot be retrieved after generation.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.createDataKey({
  context: { organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT' },
});
```

### vault.createDataKey()

### Parameters object

- `context`: `object`

### Returns object

- `dataKey`: `object`

- `encryptedKeys`: `string`

- `context`: `object`

Decrypt a data key
Decrypt a data key that was previously encrypted using WorkOS Vault.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.decryptDataKey({
  keys: 'V09TLkVLTS52MQBiZjUxY2NlYy03OGI0LTUyMDAtYjM4My0zNTczMGU3MWVmNjEBATEBJDU2OWYyNDdjLTFkY2QtNDQzMC04MjRmLWQ3N2MxZDNhZmU1NgF0NTY5ZjI0N2MtMWRjZC00NDMwLTgyNGYtZDc3YzFkM2FmZTU2pWvKMbiudRtpyjYexZCX/K9ggOEioUw2c0B62kEh+oj68uuAJQWNfPKTC+mapgJPxdnMKniKxzI7a6zmHgXTK7dSOmAzJBDhDgtEiaqyKTM=',
});
```

### vault.decryptDataKey()

### Parameters object

- `keys`: `string`

### Returns object

- `id`: `string`

- `key`: `string`

Encrypt data
Perform a local encryption option. A data key is generated based on the provided key context and used to encrypt the data. The operation happens locally and neither the plaintext nor encrypted data are sent over the network.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.encrypt('keep it secret, keep it safe', {
  organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
});
```

### vault.encrypt()

### Parameters

- `data`: `string`

- `context`: `object`

- `associatedData?`: `string`

### Returns

- `encryptedData`: `string`

Decrypt data
Decrypt data that was previously encrypted with Vault. The data key in the ciphertext is decrypted using the Vault API and used to decrypt the remaining data. The decryption operations happen locally and neither the plaintext nor encrypted data are sent over the network.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.vault.decrypt(
  'J/HGPfUVMxY1GGvViE3MDe31fOU9BuIUja0/ekDOraRaA3v13YRnwLvDWbnSPjWjzgFXT1MuRUtNLnYxAGQ0ZWNkYjkwLTMwZmMtNTYwYS04MGM0LWExYWQ2N2IyYjUzYwEBMQEkMDIxOTlmM2EtMjE4NS00ODg4LTkzNzgtZTA0ODAxOGRkN2M1AXQwMjE5OWYzYS0yMTg1LTQ4ODgtOTM3OC1lMDQ4MDE4ZGQ3YzWdnLz+Zc8ySzyfZYOVKmuz2k3rNFa6MAihjl9+5u6fiXOjmavMBUcSg0wLFDxznK0UToroLyHDaPOnpN8MTlKO8lN1Qz4KSCpQWawThmSIZ2wwwiR1jY3AOo9P/YygzE5v',
);
```

### vault.decrypt()

### Parameters

- `encryptedData`: `string`

- `associatedData?`: `string`

### Returns

- `data`: `string`

# Widgets

Widgets are React components that provide complete functionality for common enterprise app workflows.

## Generate a Widget token

Generate a widget token scoped to an organization and user with the specified scopes.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const { token } = await workos.widgets.getToken({
  organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  userId: 'user_01EHZNVPK3SFK441A1RGBFSHRT',
  scopes: ['widgets:users-table:manage'],
});
```

### widgets.getToken()

### Parameters object

- `organizationId`: `string`

- `userId?`: `string`

scopes: "widgets:users-table:manage"[]

### Returns

- `token`: `String`

# WorkOS Connect

WorkOS Connect is a unified interface that simplifies authentication and authorization across customers, partners, and external SaaS tools.

Read more about how Connect integrates with AuthKit here.

Authorize
When authenticating a user for a WorkOS Connect application, this is the endpoint they should be redirected to. If they’re not already logged in, the user will be redirected to the AuthKit login page. For a third-party application, the user will have to authorize the application’s access on their first access.

```bash
curl https://<subdomain>.authkit.app/oauth2/authorize -G \
  -d "client_id=client_01JP8BD0CZ401TDF9X54NT5ZEK" \
  -d "nonce=4QWsQj7bUUkCXnoC" \
  --data-urlencode "redirect_uri=https://app.example.com/callback" \
  -d "response_type=code" \
  --data-urlencode "scope=openid profile email offline_access" \
  -d "state=GPc459ttUQhB9oPn"
```

**GET**

`/oauth2/authorize`

### Parameters

- `client_id`: `string`

- `nonce`: `string`

- `redirect_uri`: `string`

- `response_type`: `"code"`

- `scope`: `string`

- `state?`: `string`

- `code_challenge?`: `string`

- `code_challenge_method?`: `"S256"`

### Returns

- `url`: `string`

Token
This endpoint is called by WorkOS Connect Applications to get access tokens, ID tokens, and refresh tokens, depending on the grant_type provided when requested.

This endpoint is authenticated by providing the WorkOS Application’s client ID and client secret in the body of the request.

There are four grant types available:

Authorization code

## Refresh token

Client credentials
Device code
Each is described in greater detail below.

Authorization code grant
Used by WorkOS Connect OAuth Applications to exchange an authorization code for access tokens, ID tokens, and refresh tokens.

```bash
curl -X POST https://<subdomain>.authkit.app/oauth2/token \
  -d "client_id=client_01JP8BD0CZ401TDF9X54NT5ZEK" \
  -d "client_secret=1eaaf7a47948398d89e2b07dce912b6a9c0282aa20e88c026fcb42fd6b06b73e" \
  -d "grant_type=authorization_code" \
  -d "code=01JMGA70GA2W47M7Z53JG355GW" \
  -d "redirect_uri=https://app.example.com/callback"
```

**POST**

`/oauth2/token`

### Parameters

- `client_id`: `string`

- `client_secret`: `string`

- `grant_type`: `"authorization_code"`

- `code`: `string`

- `redirect_uri`: `string`

- `code_verifier?`: `string`

### Returns object

- `access_token`: `string`

- `expires_in`: `integer`

- `id_token`: `string`

- `refresh_token?`: `string`

- `token_type`: `"bearer"`

## Access token

The access token for WorkOS Connect OAuth Applications contains the following claims.

Decoded access token

```json
{
  "iss": "https://<subdomain>.authkit.app",
  "aud": "client_123456789",
  "sub": "user_01JQ0E27VT3MH79RY0FVA4QBP9",
  "org_id": "org_01HRDMC6CM357W30QMHMQ96Q0S",
  "sid": "app_consent_01JQ0E27WE4K1RCMH7Q094M1GJ",
  "jti": "01JQ0E27ZXE4XNHVP870S6PWYN",
  "exp": 1742698034,
  "iat": 1742697734
}
Access token JWT

iss: string

aud: string

sub: string

org_id?: string

sid: string

jti: string

exp: DateTime

iat: DateTime
```

## ID token

The ID token, when requested with the openid scope, contains information about the user’s identity, like name and email address.

Decoded ID token

```json
{
  "iss": "https://<subdomain>.authkit.app",
  "aud": "client_01JP8BD0CZ401TDF9X54NT5ZEK",
  "sub": "user_01JQ0E27VT3MH79RY0FVA4QBP9",
  "name": "Leroy Jenkins",
  "given_name": "Leroy",
  "family_name": "Jenkins",
  "email": "leroy.jenkins@example.com",
  "email_verified": true,
  "nonce": "f39a8e47d2c9b6fa",
  "exp": 1742702581,
  "iat": 1742698981
}
ID token JWT

iss: string

aud: string

sub: string

name?: string

given_name?: string

family_name?: string

email?: string

email_verified?: boolean

exp: DateTime

iat: DateTime
Refresh token grant
Used by WorkOS Connect OAuth Applications to exchange a refresh token for new access tokens and/or ID tokens. The refresh token is provided when the initial oauth2/authorize request is made with the offline_access scope.

The access token and ID tokens issued here are the same as those issued for the initial authorization_code grant.

cURL
curl -X POST https://<subdomain>.authkit.app/oauth2/token \
  -d "client_id=client_01JP8BD0CZ401TDF9X54NT5ZEK" \
  -d "client_secret=1eaaf7a47948398d89e2b07dce912b6a9c0282aa20e88c026fcb42fd6b06b73e" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=01JMGA70GA2W47M7Z53JG355GW" \
  -d "scope=openid profile email"
```

**POST**

`/oauth2/token`

### Parameters

- `client_id`: `string`

- `client_secret`: `string`

- `grant_type`: `"refresh_token"`

- `refresh_token`: `string`

- `scope?`: `string`

### Returns object

- `access_token`: `string`

- `expires_in`: `integer`

- `id_token`: `string`

- `refresh_token?`: `string`

- `token_type`: `"bearer"`

Client credentials grant
Used by WorkOS Connect M2M Applications to exchange the app’s credentials for access tokens.

```bash
curl -X POST https://<subdomain>.authkit.app/oauth2/token \
  -d "client_id=client_01JP8BD0CZ401TDF9X54NT5ZEK" \
  -d "client_secret=1eaaf7a47948398d89e2b07dce912b6a9c0282aa20e88c026fcb42fd6b06b73e" \
  -d "grant_type=client_credentials" \
  -d "scope=openid profile email"
```

**POST**

`/oauth2/token`

### Parameters

- `client_id`: `string`

- `client_secret`: `string`

- `grant_type`: `"client_credentials"`

- `scope?`: `string`

### Returns object

- `access_token`: `string`

- `expires_in`: `integer`

- `token_type`: `"bearer"`

## Access token

The access token for WorkOS Connect M2M Applications contains the following claims.

Decoded access token

```json
{
  "iss": "https://<subdomain>.authkit.app",
  "aud": "client_01K25SZKHKNZZYSP7E5E3N2T0M",
  "sub": "client_01HK20JT00434A411X45ZNPTBA",
  "org_id": "org_01HZ99J6C0H3JBP78CYQM7J0FE",
  "sid": "app_consent_01JQ0E27WE4K1RCMH7Q094M1GJ",
  "jti": "01JQ0E27ZXE4XNHVP870S6PWYN",
  "exp": 1742698034,
  "iat": 1742697734
}
Access token JWT

iss: string

sub: string

org_id?: string

jti: string

exp: DateTime

iat: DateTime
Token introspection
Indicates whether the given token (access token or refresh token) is valid and active. Additionally, it provides details about the token.

This endpoint is authenticated by provided the WorkOS Application’s client ID and client secret in the body of the request.

cURL
curl -X POST https://<subdomain>.authkit.app/oauth2/introspection \
  -d "client_id=client_01JP8BD0CZ401TDF9X54NT5ZEK" \
  -d "client_secret=1eaaf7a47948398d89e2b07dce912b6a9c0282aa20e88c026fcb42fd6b06b73e" \
  -d "token=eyJhbGciOiJSUzI1NiIsImtpZCI6InNzb19vaWRjX2tleV9wYWlyXzAxSlBYTjZLRjdOQUVBWlRGRFlFU0FFMEtYIn0.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyXzAxSlBYTjZLQTc2MjJLSjRWUDgzWDFOVEtYIiwic2lkIjoiYXBwX2NvbnNlbnRfMDFKUFhONktBUVc4M0FNWFhZNVdYM1JIVEoiLCJqdGkiOiIwMUpQWE42S0ZHWlFZVzNBTTJERVZYODRZUyIsImV4cCI6MTc0MjYwNDg1MywiaWF0IjoxNzQyNjA0NTUzfQ.dsMI3PBp5LWGeUosFUYYLsjC78swFMI4EUVXW1LN7yd80hxLhAvCX6gKN2s9h13a1tkAX77PDI2PooEJ8RQyB-Zcp_wzdomHffjqCeL-YgGojuCUmgjOm9w7kwg86e81tcMBIX3y872pe9jg1HrVs0t_tJNjoLEKtSwm-Flegttyg7M5SikrHKzul0Jv6ovaXjN4RygDPH6Nbg7Ewag5UwYd9aQK7IRG2oXZPC6WjJx-boyRvwgAqJ5pCedRc2ta5-sb3KyrgS6Xb0S3y1KA57RiDvJdQp8z_wL2_4e6iwG00a7OwyorIDpxKl5kAJE_Fct71931lB4EmNsGkVLxoA" \
  -d "token_type_hint=access_token"
```

**POST**

`/oauth2/token`

### Parameters

- `client_id`: `string`

- `client_secret`: `string`

- `token`: `string`

- `token_type_hint?`: `"access_token" | "refresh_token"`

### Returns object

- `active`: `boolean`

- `token_type`: `"access_token" | "refresh_token"`

- `client_id`: `string`

- `iss`: `string`

- `sub`: `string`

- `iat`: `integer`

- `sid?`: `string`

- `jti?`: `string`

- `org_id?`: `string`

- `exp?`: `integer`

User information
Provides information about the User referenced by the access token’s sub claim. Which claims are returned depends on the scopes originally granted when the access token was issued.

This endpoint is authenticated by providing the previously acquired access token in the Authorization header.

```bash
curl -X POST https://<subdomain>.authkit.app/oauth2/userinfo \
  -H "authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InNzb19vaWRjX2tleV9wYWlyXzAxSlBYTjZLRjdOQUVBWlRGRFlFU0FFMEtYIn0.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyXzAxSlBYTjZLQTc2MjJLSjRWUDgzWDFOVEtYIiwic2lkIjoiYXBwX2NvbnNlbnRfMDFKUFhONktBUVc4M0FNWFhZNVdYM1JIVEoiLCJqdGkiOiIwMUpQWE42S0ZHWlFZVzNBTTJERVZYODRZUyIsImV4cCI6MTc0MjYwNDg1MywiaWF0IjoxNzQyNjA0NTUzfQ.dsMI3PBp5LWGeUosFUYYLsjC78swFMI4EUVXW1LN7yd80hxLhAvCX6gKN2s9h13a1tkAX77PDI2PooEJ8RQyB-Zcp_wzdomHffjqCeL-YgGojuCUmgjOm9w7kwg86e81tcMBIX3y872pe9jg1HrVs0t_tJNjoLEKtSwm-Flegttyg7M5SikrHKzul0Jv6ovaXjN4RygDPH6Nbg7Ewag5UwYd9aQK7IRG2oXZPC6WjJx-boyRvwgAqJ5pCedRc2ta5-sb3KyrgS6Xb0S3y1KA57RiDvJdQp8z_wL2_4e6iwG00a7OwyorIDpxKl5kAJE_Fct71931lB4EmNsGkVLxoA"
```

**POST**

`/oauth2/userinfo`

### Returns

- `sub`: `string`

- `name?`: `string`

- `given_name?`: `string`

- `family_name?`: `string`

- `email?`: `string`

- `email_verified?`: `boolean`

## Metadata

Connect exposes several metadata endpoints in order to be compatible with a wide array of clients that support discovery and automatic configuration.

OpenID configuration
This discovery endpoint provides the standard configuration for OpenID clients to interact with WorkOS Connect.

```bash
curl https://<subdomain>.authkit.app/.well-known/openid-configuration
```

**GET**

/.well-known/openid-configuration

### Returns object

- `issuer`: `string`

- `authorization_endpoint`: `string`

- `grant_types_supported`: `array`

- `id_token_signing_alg_values_supported`: `array`

- `introspection_endpoint`: `string`

- `jwks_uri`: `string`

- `response_types_supported`: `array`

- `subject_types_supported`: `array`

- `token_endpoint`: `string`

- `userinfo_endpoint`: `string`

OAuth Authorization Server
This endpoint provides
RFC 6749
-compatible OAuth Authorization Server metadata.

Model Context Protocol (MCP) clients that support the latest version of the specification use this endpoint. Read more here about how to use AuthKit as an authorization server for an MCP server.

```bash
curl https://<subdomain>.authkit.app/.well-known/oauth-authorization-server
```

**GET**

/.well-known/oauth-authorization-server

### Returns object

- `authorization_endpoint`: `string`

- `code_challenge_methods_supported`: `array`

- `grant_types_supported`: `array`

- `introspection_endpoint`: `string`

- `issuer`: `string`

- `registration_endpoint`: `string`

- `scopes_supported`: `array`

- `response_modes_supported`: `array`

- `response_types_supported`: `array`

- `token_endpoint`: `string`

- `token_endpoint_auth_methods_supported`: `array`

# CLI Auth

CLI Auth for WorkOS Connect enables third-party applications to build command-line tools that integrate with your app’s credentials using the
OAuth 2.0 Device Authorization Flow
.

The CLI Auth flow for Connect involves two main endpoints:

The device authorization URL initiates the flow by obtaining device codes, user codes, and verification URIs.
The device access token URL is where the device exchanges the device code for access and refresh tokens after the user authenticates.
Read more about CLI Auth here.

## Authorize device

Initiates the device authorization flow for WorkOS Connect applications. This endpoint implements the
OAuth 2.0 Device Authorization Flow
and is designed for CLI applications and other devices with limited input capabilities.

This endpoint is used by third-party applications to authenticate users through WorkOS Connect. Users will be prompted to authorize the application’s access to their data as part of the consent flow.

```bash
curl -X POST 'https://<subdomain>.authkit.app/oauth2/device_authorization' \
  -d 'client_id=client_01JP8BD0CZ401TDF9X54NT5ZEK' \
  --data-urlencode 'scope=openid profile email'
```

**POST**

`/oauth2/device_authorization`

### Parameters

- `client_id`: `string`

- `scope?`: `string`

### Returns

- `device_code`: `string`

- `user_code`: `string`

- `verification_uri`: `string`

- `verification_uri_complete`: `string`

- `expires_in`: `integer`

- `interval`: `integer`

Device code grant
Exchanges a device code for access and refresh tokens as part of the device authorization flow for WorkOS Connect applications. This endpoint should be polled repeatedly until the user authorizes the request, declines it, or the device code expires.

```bash
curl -X POST 'https://<subdomain>.authkit.app/oauth2/token' \
  -d 'grant_type=urn:ietf:params:oauth:grant-type:device_code' \
  -d 'device_code=ETaHpDNhfxu0HyLhp6b8HGSh26NzYJSKw3TT6aS7HKKBhTyTD0zAW6ApTTolug0b' \
  -d 'client_id=client_01JP8BD0CZ401TDF9X54NT5ZEK'
```

**POST**

`/oauth2/token`

### Parameters

grant_type: "urn:ietf:params:oauth:grant-type:device_code"

- `device_code`: `string`

- `client_id`: `string`

- `client_secret?`: `string`

### Returns

- `access_token`: `string`

- `refresh_token`: `string`

- `id_token`: `string`

- `token_type`: `"Bearer"`

- `expires_in`: `integer`

The returned tokens are similar to those provided by the authorization code grant.

## Standalone Connect

Standalone Connect allows applications with existing authentication systems to use AuthKit as their OAuth authorization server. Instead of migrating your entire authentication stack, you can leverage WorkOS’s OAuth infrastructure while keeping your existing user authentication as the source of truth.

Read more in the Standalone Connect guide.

Complete external authentication
Completes an external authentication flow and returns control to AuthKit. This endpoint is used with Standalone Connect to bridge your existing authentication system with the Connect OAuth API infrastructure.

After successfully authenticating a user in your application, calling this endpoint will:

Create or update the user in AuthKit, using the given id as its external_id.
Return a redirect_uri your application should redirect to in order for AuthKit to complete the flow
Users are automatically created or updated based on the id and email provided. If a user with the same id exists, their information is updated. Otherwise, a new user is created.

If you provide a new id with an email that already belongs to an existing user, the request will fail with an error as email addresses are unique to a user.

```bash
curl -X POST https://api.workos.com/authkit/oauth2/complete \
  -H "authorization: Bearer sk_example_123456789" \
  -H "content-type: application/json" \
  -d '{
    "external_auth_id": "ext_auth_01J3X4Y5Z6A7B8C9D0E1F2G3H4",
    "user": {
      "id": "user_12345",
      "email": "leroy.jenkins@example.com",
      "first_name": "Leroy",
      "last_name": "Jenkins",
      "metadata": {
        "department": "Engineering",
        "role": "Developer"
      }
    }
  }'
```

**POST**

`/authkit/oauth2/complete`

### Parameters

- `external_auth_id`: `string`

- `user`: `object`

- `user_consent_options?`: `array`

### Returns

- `redirect_uri`: `string`

User Consent Options
The user_consent_options can take an array of consent options that the user will be required to choose from on AuthKit’s OAuth consent screen. The chosen option will then become available as a JWT claim on the issued access token.

These options can be presented as either a flat or grouped set of options.

```bash
curl -X POST https://api.workos.com/authkit/oauth2/complete \
  -H "authorization: Bearer sk_example_123456789" \
  -H "content-type: application/json" \
  -d '{
    "external_auth_id": "ext_auth_01J3X4Y5Z6A7B8C9D0E1F2G3H4",
    "user": {
      "id": "user_12345",
      "email": "leroy.jenkins@example.com"
    },
    "user_consent_options": [
      {
        "claim": "urn:example:organization",
        "type": "enum",
        "label": "Organization",
        "choices": [
          { "value": "org_123", "label": "Acme Corp" },
          { "value": "org_456", "label": "Globex Inc" }
        ]
      }
    ]
  }'
User Consent Options

claim: string

type: "enum"

label: string

choices: array
```

## Applications

The Applications API allows you to programmatically manage Connect Applications and their associated client secrets.

WorkOS Connect supports two types of applications: OAuth and Machine-to-Machine M2M.

## OAuth Applications

OAuth applications are designed for web, mobile, desktop, and CLI applications where a user needs to authenticate.

```bash
{
  "object": "connect_application",
  "id": "app_01J9Q2Z3X4Y5W6V7U8T9S0R1Q",
  "client_id": "client_01J9Q2Z3X4Y5W6V7U8T9S0R1Q",
  "name": "My Application",
  "description": "Application description",
  "application_type": "oauth",
  "redirect_uris": [
    {
      "uri": "https://example.com/callback",
      "default": true
    }
  ],
  "uses_pkce": false,
  "is_first_party": true,
  "scopes": ["example-permission:read", "example-permission:write"],
  "created_at": "2024-01-15T12:30:00.000Z",
  "updated_at": "2024-01-15T12:30:00.000Z"
}
OAuth Application

object: "connect_application"

id: string

client_id: string

name: string

description?: string

application_type: "oauth"

redirect_uris: array

uses_pkce: boolean

is_first_party: boolean

was_dynamically_registered?: boolean

organization_id?: string

scopes: string[]

created_at: string

updated_at: string
```

## Machine-to-Machine Applications

M2M applications are designed for server-to-server authentication without user interaction.

M2M Application Example

```bash
{
  "object": "connect_application",
  "id": "app_01J9Q2Z3X4Y5W6V7U8T9S0R1Q",
  "client_id": "client_01J9Q2Z3X4Y5W6V7U8T9S0R1Q",
  "name": "Backend Service",
  "description": "Machine-to-machine application for API access",
  "application_type": "m2m",
  "organization_id": "org_01J9Q2Z3X4Y5W6V7U8T9S0R1Q",
  "scopes": ["api:read", "api:write", "api:admin"],
  "created_at": "2024-01-15T12:30:00.000Z",
  "updated_at": "2024-01-15T12:30:00.000Z"
}
M2M Application

object: "connect_application"

id: string

client_id: string

name: string

description?: string

application_type: "m2m"

organization_id: string

scopes: string[]

created_at: string

updated_at: string
Get a Connect Application
Retrieve details for a specific Connect Application by ID or client ID.

cURL
curl https://api.workos.com/connect/applications/app_01J9Q2Z3X4Y5W6V7U8T9S0R1Q \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

`/connect/applications/:id`

### Parameters

- `id`: `string`

### Returns

- `connect_application`: `object`

## List Connect Applications

List all Connect Applications in the current environment with optional filtering.

```bash
curl "https://api.workos.com/connect/applications?organization_id=org_01J9Q2Z3X4Y5W6V7U8T9S0R1Q&limit=20" \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

`/connect/applications`

### Parameters

- `organization_id?`: `string`

- `limit?`: `number`

- `before?`: `string`

- `after?`: `string`

- `order?`: `"asc" | "desc"`

### Returns object

- `object`: `string`

- `data`: `array`

- `list_metadata`: `object`

## Create a Connect Application

Create a new Connect Application. Supports both OAuth and Machine-to-Machine (M2M) application types.

```bash
curl -X POST https://api.workos.com/connect/applications \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  --data '{
    "name": "My OAuth App",
    "application_type": "oauth",
    "description": "Customer-facing OAuth application",
    "redirect_uris": [
      {
        "uri": "https://example.com/callback",
        "default": true
      }
    ],
    "uses_pkce": false,
    "is_first_party": false,
    "organization_id": "org_01J9Q2Z3X4Y5W6V7U8T9S0R1Q",
    "scopes": ["example-permission:write"]
  }'
```

**POST**

`/connect/applications`

### Parameters

- `name`: `string`

- `application_type`: `string`

- `description?`: `string`

- `scopes?`: `string[]`

- `redirect_uris?`: `array`

- `uses_pkce?`: `boolean`

- `is_first_party`: `boolean`

- `organization_id?`: `string`

### Returns

- `connect_application`: `object`

## Update a Connect Application

Update an existing Connect Application. For OAuth applications, you can update redirect URIs. For all applications, you can update the name, description, and scopes.

```bash
curl -X PUT https://api.workos.com/connect/applications/app_01J9Q2Z3X4Y5W6V7U8T9S0R1Q \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  --data '{
    "name": "Updated Application Name",
    "description": "Updated description",
    "redirect_uris": [
      {
        "uri": "https://example.com/new-callback",
        "default": true
      },
      {
        "uri": "https://example.com/another-callback",
        "default": false
      }
    ],
    "scopes": ["profile", "email", "openid"]
  }'
```

**PUT**

`/connect/applications/:id`

### Parameters

- `id`: `string`

- `name?`: `string`

- `description?`: `string | null`

- `scopes?`: `string[]`

- `redirect_uris?`: `array`

### Returns

- `connect_application`: `object`

## Delete a Connect Application

Delete an existing Connect Application.

### Request

```bash
curl -X DELETE https://api.workos.com/connect/applications/app_01J9Q2Z3X4Y5W6V7U8T9S0R1Q \
  --header "Authorization: Bearer sk_example_123456789"
```

**DELETE**

`/connect/applications/:id`

### Parameters

- `id`: `string`

## Client Secrets

Client secrets are used to authenticate Connect Applications when making requests to WorkOS APIs.

When a client secret is first created, the response includes an additional secret field containing the plaintext secret. This is the only time the plaintext secret will be returned.

### Example Client Secret

```bash
{
  "object": "connect_application_secret",
  "id": "secret_01J9Q2Z3X4Y5W6V7U8T9S0R1Q",
  "secret": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "secret_hint": "abc123",
  "last_used_at": "2024-01-15T14:30:00.000Z",
  "created_at": "2024-01-15T12:30:00.000Z",
  "updated_at": "2024-01-15T14:30:00.000Z"
}
connect_application_secret

object: "connect_application_secret"

id: string

secret_hint: string

last_used_at?: string

created_at: string

updated_at: string

secret?: string
List Client Secrets
List all client secrets associated with a Connect Application.

The plaintext secret is never returned after creation. Only the secret hint is included.

cURL
curl https://api.workos.com/connect/applications/app_01J9Q2Z3X4Y5W6V7U8T9S0R1Q/client_secrets \
  --header "Authorization: Bearer sk_example_123456789"
```

**GET**

`/connect/applications/:id/`client_secrets``

### Parameters

- `id`: `string`

### Returns

- `client_secrets`: `array`

## Create a Client Secret

Create a new client secret for a Connect Application.

This is the only time the plaintext secret will be returned and must be stored securely.

```bash
curl -X POST https://api.workos.com/connect/applications/app_01J9Q2Z3X4Y5W6V7U8T9S0R1Q/client_secrets \
  --header "Authorization: Bearer sk_example_123456789" \
  --header "Content-Type: application/json" \
  --data '{}'
```

**POST**

`/connect/applications/:id/`client_secrets``

### Parameters

- `id`: `string`

### Returns

- `connect_application_secret`: `object`

## Delete a Client Secret

Delete (revoke) an existing client secret.

### Request

```bash
curl -X DELETE https://api.workos.com/connect/client_secrets/secret_01J9Q2Z3X4Y5W6V7U8T9S0R1Q \
  --header "Authorization: Bearer sk_example_123456789"
```

**DELETE**

`/connect/`client_secrets`/:id`

### Parameters

- `id`: `string`

# Magic Link

> ⚠️ Deprecated API: Magic Link has been replaced by the AuthKit Magic Auth API.

The Magic Link API can be used to add Passwordless Authentication to your app.

Passwordless SessionDeprecated
An object representing a passwordless authentication session.

### Example Passwordless Session

```javascript
const passwordlessSession = {
  object: 'passwordless_session',
  id: 'passwordless_session_01EHDAK2BFGWCSZXP9HGZ3VK8C',
  email: 'marcelina@example.com',
  expiresAt: '2020-08-13T05:50:00.000Z',
  link: 'https://auth.workos.com/passwordless/4TeRexuejWCKs9rrFOIuLRYEr/confirm',
};
```

#### `interface PasswordlessSession`

- `object`: `string`

- `email`: `string`

- `expiresAt`: `Date`

- `link`: `string`

## Create Passwordless SessionDeprecated

Create a Passwordless Session for a Magic Link Connection.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

const session = await workos.passwordless.createSession({
  email: 'marcelina@example.com',
  type: 'MagicLink',
});
```

### passwordless.createSession()

### Parameters object

- `email`: `string`

- `type`: `"MagicLink"`

- `redirectURI?`: `string`

- `expiresIn?`: `number`

- `state?`: `string`

### Returns

PasswordlessSession
Email a Magic LinkDeprecated
Email a user the Magic Link confirmation URL.

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_example_123456789');

await workos.passwordless.sendSession(
  'passwordless_session_01EHDAK2BFGWCSZXP9HGZ3VK8C',
);
Sends email
```

### passwordless.sendSession()

### Parameters

- `id`: `string`

### Returns object

- `success`: `boolean`