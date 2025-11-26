import { authKit } from "@workos/authkit-sveltekit";

export const load = authKit.withAuth(async () => {
    return {}
})