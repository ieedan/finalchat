import { authKit } from "@workos/authkit-sveltekit";

export async function GET(event) {
    return await authKit.signOut(event);
}