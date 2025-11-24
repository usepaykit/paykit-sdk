import { eq } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/client.js';
import { apiKeys } from '../db/schema.js';

export async function authMiddleware(c: Context, next: Next) {
  const apiKey = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    throw new HTTPException(401, {
      message: 'Missing API key. Provide Bearer token.',
    });
  }

  const apiKeyRecord = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.apiKey, apiKey))
    .limit(1);

  if (!apiKeyRecord) {
    throw new HTTPException(401, {
      message: 'Invalid API key',
    });
  }

  c.set('userId', apiKeyRecord.userId);

  await next();
}
