import { createCustomerSchema, updateCustomerSchema } from '@paykit-sdk/core';
import { eq, and } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { db } from '../db/client.js';
import { customers } from '../db/schema.js';

const customersRoute = new Hono();

// POST /v1/customers - Create customer
customersRoute.post('/', async c => {
  const apiKey = c.get('apiKey' as unknown as never) as string;
  const body = await c.req.json();

  const validated = createCustomerSchema.parse(body);

  // Check if customer already exists
  const existing = await db
    .select()
    .from(customers)
    .where(and(eq(customers.apiKey, apiKey), eq(customers.email, validated.email)))
    .limit(1);

  if (existing.length > 0) {
    return c.json(existing[0], 200);
  }

  // Create new customer
  const [customer] = await db
    .insert(customers)
    .values({
      apiKey,
      email: validated.email,
      name: validated.name,
      phone: validated.phone,
      metadata: validated.metadata,
    })
    .returning();

  return c.json(customer, 201);
});

// GET /v1/customers/:id - Retrieve customer
customersRoute.get('/:id', async c => {
  const apiKey = c.get('apiKey' as unknown as never) as string;
  const id = c.req.param('id');

  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.apiKey, apiKey)))
    .limit(1);

  if (!customer) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  return c.json(customer);
});

// GET /v1/customers?email=...&provider=... - Find by email
customersRoute.get('/', async c => {
  const { email, provider } = z
    .object({
      email: z.string().email(),
      provider: z.string().optional(),
    })
    .parse(c.req.query());

  const apiKey = c.get('apiKey' as unknown as never) as string;

  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.apiKey, apiKey), eq(customers.email, email)))
    .limit(1);

  if (!customer) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  return c.json(customer);
});

// PATCH /v1/customers/:id - Update customer
customersRoute.patch('/:id', async c => {
  const apiKey = c.get('apiKey' as unknown as never) as string;
  const id = c.req.param('id');
  const body = await c.req.json();

  const validated = updateCustomerSchema.omit({ provider_metadata: true }).parse(body);

  const [customer] = await db
    .update(customers)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.apiKey, apiKey)))
    .returning();

  if (!customer) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  return c.json(customer);
});

// DELETE /v1/customers/:id - Delete customer
customersRoute.delete('/:id', async c => {
  const apiKey = c.get('apiKey' as unknown as never) as string;
  const id = c.req.param('id');

  const [deleted] = await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.apiKey, apiKey)))
    .returning();

  if (!deleted) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  return c.json({ success: true }, 200);
});

export default customersRoute;
