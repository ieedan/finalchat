import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        PUBLIC_WORKOS_CLIENT_ID: z.string(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: process.env,
});