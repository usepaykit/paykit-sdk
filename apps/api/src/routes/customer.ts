import { createCustomerSchema, updateCustomerSchema } from '@paykit-sdk/core';
import { eq, and, ilike } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { db } from '../db/client.js';
import { customers } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Variables } from '../schema.js';

const customersRoute = new Hono<{ Variables: Variables }>();

customersRoute.use('*', authMiddleware);

customersRoute.post('/', async c => {
  const organizationId = c.get('organizationId');
  const provider = c.req.header('X-Provider') as string;

  const { _pId } = z.object({ _pId: z.string().optional() }).parse(c.req.query());

  if (!provider) {
    throw new HTTPException(400, { message: 'Missing provider header' });
  }

  const body = await c.req.json();

  const validated = createCustomerSchema.parse(body);

  const customer = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.organizationId, organizationId),
        eq(customers.email, validated.email),
      ),
    )
    .limit(1)
    .then(result => result[0]);

  if (customer) return c.json(customer, 200);

  const result = await db.execute(sql`
    INSERT INTO customers (organization_id, email, name, phone, app_metadata, metadata, billing)
    VALUES (
      ${organizationId}, 
      ${validated.email}, 
      ${validated.name}, 
      ${validated.phone}, 
      ${{ providers: JSON.stringify({ [`${provider}Name`]: provider, [`${provider}Id`]: _pId ?? null }) }}, 
      ${validated.metadata}, 
      ${validated.billing}
    )
    RETURNING *
  `);

  return c.json(result, 201);
});

customersRoute.get('/:id', async c => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const { _pId } = z.object({ _pId: z.string().optional() }).parse(c.req.query());

  const provider = c.req.header('X-Provider') as string;

  const [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        ...(_pId
          ? [sql`${customers.appMetadata}->'providers'->>${provider + 'Id'} = ${_pId}`]
          : [eq(customers.id, id)]),
        eq(customers.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!customer) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  return c.json(customer);
});

customersRoute.get('/query', async c => {
  const { email, phone, name, _pId } = z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      name: z.string().optional(),
      _pId: z.string().optional(),
    })
    .parse(c.req.query());

  const organizationId = c.get('organizationId');
  const provider = c.req.header('X-Provider') as string;

  const result = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.organizationId, organizationId),
        ...(email ? [eq(customers.email, email)] : []),
        ...(phone ? [eq(customers.phone, phone)] : []),
        ...(name ? [ilike(customers.name, `%${name}%`)] : []),
        ...(_pId
          ? [sql`${customers.appMetadata}->'providers'->>${provider + 'Id'} = ${_pId}`]
          : []),
      ),
    )
    .limit(1)
    .then(result => result[0]);

  if (!result) throw new HTTPException(404, { message: 'Customer not found' });

  return c.json(result);
});

customersRoute.patch('/:id', async c => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const provider = c.req.header('X-Provider') as string;

  const { _pId } = z.object({ _pId: z.string().optional() }).parse(c.req.query());

  const validated = updateCustomerSchema
    .omit({ provider_metadata: true })
    .parse(await c.req.json());

  const result = await db
    .update(customers)
    .set({ ...validated, updatedAt: new Date() })
    .where(
      and(
        ...(_pId
          ? [sql`${customers.appMetadata}->'providers'->>${provider + 'Id'} = ${_pId}`]
          : [eq(customers.id, id)]),
        eq(customers.organizationId, organizationId),
      ),
    )
    .returning()
    .then(result => result[0]);

  if (!result) throw new HTTPException(404, { message: 'Customer not found' });

  return c.json(result);
});

customersRoute.delete('/:id', async c => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const provider = c.req.header('X-Provider') as string;

  const { _pId } = z.object({ _pId: z.string().optional() }).parse(c.req.query());

  const result = await db
    .delete(customers)
    .where(
      and(
        eq(customers.organizationId, organizationId),
        ...(_pId
          ? [sql`${customers.appMetadata}->'providers'->>${provider + 'Id'} = ${_pId}`]
          : [eq(customers.id, id)]),
      ),
    )
    .returning()
    .then(result => result[0]);

  if (!result) throw new HTTPException(404, { message: 'Customer not found' });

  return c.json({ success: true }, 200);
});

export default customersRoute;
