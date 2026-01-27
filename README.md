<p align="center">
  <img src="src/lib/assets/favicon.svg" alt="Finalchat logo" width="64" height="64" />
</p>

<h1 align="center">Finalchat</h1>
<p align="center">The last chat app you'll ever need.</p>

https://github.com/user-attachments/assets/cd81fecd-e510-408c-86dc-db49ee8307ed

I built this because I wanted a chat app that was fast, free, and wonderful to use on both desktop and mobile.

I call it _Finalchat_ because this is my final draft. This is everything I learned from [thom.chat](https://thom.chat) and [comprably.ai](https://comprably.ai). The last chat app.

But to really be the last chat app it can't be closed source and it can't be SaaS. So here it is open source and free to use.

## Features

- Lightning fast interface
- Bring your own key from [OpenRouter](https://openrouter.ai)
- Basic and Advanced modes for those who want more or less control
- Share your chats with your friends
- The best model picker in any chat app
- Upload and generate images
- Hotkeys for everything
- Models can read links with custom handlers for GitHub and other common sites
- Built for use on mobile devices (No seriously try it)

## The stack

- Framework [SvelteKit](https://kit.svelte.dev)
- Database [Convex](https://www.convex.dev)
- UI [shadcn-svelte](https://ui.shadcn.com/docs/installation/svelte)
- Icons [RemixIcon](https://remixicon.com)
- Object storage [R2](https://www.r2.dev)
- Authentication [WorkOs](https://workos.com)

## Want an "Open in Finalchat" button?

You can pass your prompt in the `q` query parameter along to the `/chat` route like so:

```
https://finalchat.app/chat?q=Read https://example.com and tell me about it
```
