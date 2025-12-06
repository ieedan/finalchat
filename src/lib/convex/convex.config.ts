import { defineApp } from 'convex/server';
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config.js';

const app = defineApp();
app.use(persistentTextStreaming);
export default app;
