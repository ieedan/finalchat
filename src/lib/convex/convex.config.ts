import { defineApp } from 'convex/server';
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config.js';
import r2 from '@convex-dev/r2/convex.config.js';
import migrations from '@convex-dev/migrations/convex.config.js';

const app = defineApp();
app.use(persistentTextStreaming);
app.use(r2);
app.use(migrations);

export default app;
