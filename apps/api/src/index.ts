import { Hono } from 'hono';
import customersRoute from './routes/customer.js';

const app = new Hono();

app.get('/', c => {
  return c.text('Hello Hono!');
});

app.route('/v1/customers', customersRoute);

const port = Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000;

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Server is running on http://localhost:${port}`);
