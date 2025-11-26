import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    client: {
        PUBLIC_CONVEX_URL: z.url(),
    },
    clientPrefix: "PUBLIC_",
    emptyStringAsUndefined: true,
    runtimeEnv: import.meta.env
});