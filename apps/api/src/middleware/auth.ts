import { and, eq, sql } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/client.js';
import { apiKeys } from '../db/schema.js';
import type { Variables } from '../schema.js';
import { apiKeyFromString } from '../utils.js';

export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const apiKey = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    throw new HTTPException(401, {
      message: 'Missing API key. Provide Bearer token.',
    });
  }

  const { id, secret } = apiKeyFromString(apiKey);

  if (!id || !secret) {
    throw new HTTPException(401, { message: 'Invalid API key' });
  }

  const apiKeyRecord = await db
    .select({ organizationId: apiKeys.organizationId })
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.id, id),
        eq(apiKeys.secret, secret),
        sql`${apiKeys.expiresAt} > now()`,
      ),
    )
    .limit(1)
    .then(result => result[0]);

  if (!apiKeyRecord) {
    throw new HTTPException(401, { message: 'Invalid API key' });
  }

  c.set('organizationId', apiKeyRecord.organizationId);

  await next();
}
