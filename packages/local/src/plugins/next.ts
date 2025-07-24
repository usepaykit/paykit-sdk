import { ValidationError, Webhook } from '@paykit-sdk/core';
import { server$HandleWebhook } from '../server';
import { extractParams } from '../utils';

interface WithLocalProviderNextPluginOptions {
  url: string;
  webhook: Webhook;
}

export async function withLocalProviderNextPlugin({ url, webhook: _ }: WithLocalProviderNextPluginOptions): Promise<any> {
  const body = extractParams(new URL(url));

  return await handleWebhook(body);
}

async function handleWebhook(body: Record<string, any>): Promise<Response> {
  try {
    const webhookResult = await server$HandleWebhook({ body: JSON.stringify(body), headers: {}, webhookSecret: '' });
    return Response.json(webhookResult);
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
