## Development

1. Install Dependencies

```sh
pnpm install
```

2. Configure Environment Variables

You can find the necessary environment variables in the `.env.example` file.

You will need:

- A WorkOS account
- A Convex account
- A R2 account
- An OpenRouter account

Add the environment variables to your `.env.local` file.

You will also need to configure environment variables for your convex deployment. You only need to configure the environment variables in the [`env.convex.ts`](src/lib/env.convex.ts) file.

3. Run the Development Server

```sh
pnpm dev
```
