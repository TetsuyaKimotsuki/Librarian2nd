import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello, Hono + Prisma!'));

export default app;
