import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import customersRoute from './routes/customer.js';

const app = new Hono();

app.get('/', c => {
  return c.text('Hello Hono!');
});

app.route('/v1/customers', customersRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  info => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
