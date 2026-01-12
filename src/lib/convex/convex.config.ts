import { defineApp } from 'convex/server';
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config.js';
import r2 from '@convex-dev/r2/convex.config.js';
import workOSAuthKit from '@convex-dev/workos-authkit/convex.config.js';

const app = defineApp();
app.use(persistentTextStreaming);
app.use(r2);
app.use(workOSAuthKit);

export default app;
