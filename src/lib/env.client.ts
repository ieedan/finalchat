import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    client: {
        PUBLIC_CONVEX_URL: z.url(),
        PUBLIC_WORKOS_CLIENT_ID: z.string(),
        PUBLIC_WORKOS_REDIRECT_URI: z.url(),
    },
    clientPrefix: "PUBLIC_",
    runtimeEnv: import.meta.env
});