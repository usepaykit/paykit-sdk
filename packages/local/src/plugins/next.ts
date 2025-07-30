import { logger, tryCatchAsync, Webhook } from '@paykit-sdk/core';
import { server$HandleWebhook } from '../server';
import { extractParams } from '../utils';

interface WithLocalProviderNextPluginOptions {
  url: string;
  webhook: Webhook;
}

export async function withLocalProviderNextPlugin({ url, webhook: _ }: WithLocalProviderNextPluginOptions): Promise<any> {
  const body = extractParams(new URL(url));

  const [data, error] = await tryCatchAsync(server$HandleWebhook({ body: JSON.stringify(body), headers: {}, webhookSecret: '' }));

  if (error) {
    logger.error(`[PayKit] Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return Response.json({ error: 'Failed to process webhook' }, { status: 500 });
  }

  return Response.json(data);
}
