import { ValidationError, logger } from '@paykit-sdk/core';
import {
  server$CreateCustomer,
  server$RetrieveCustomer,
  server$UpdateCustomer,
  server$CreateCheckout,
  server$RetrieveCheckout,
  server$RetrieveSubscription,
  server$UpdateSubscriptionHelper,
  server$HandleWebhook,
} from '../server';

export interface RequestLike {
  method?: string;
  url: string;
  headers: any;
  json(): Promise<any>;
}

type ResponseLike = any;

export async function local$NextPlugin(request: RequestLike, response: ResponseLike): Promise<any> {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Remove local$NextPlugin() from your API route before deploying');
    return response.json({ error: 'Local plugin not allowed in production. Remove local$NextPlugin() from your API routes.' }, { status: 500 });
  }

  try {
    const method = request.method?.toLowerCase();
    const url = new URL(request.url);

    if (method === 'get') {
      return await handleGet(url, response);
    } else if (method === 'post') {
      return await handlePost(request, response);
    } else if (method === 'put') {
      return await handlePut(request, response);
    } else if (method === 'delete') {
      return await handleDelete(url, response);
    }

    return response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    logger.error('Local plugin error');

    if (error instanceof ValidationError) {
      return response.json({ error: error.message }, { status: 400 });
    }

    return response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGet(url: URL, response: ResponseLike): Promise<ResponseLike> {
  const resource = url.searchParams.get('resource');
  const id = url.searchParams.get('id');

  if (!resource) {
    return response.json({ error: 'Resource type is required' }, { status: 400 });
  }

  switch (resource) {
    case 'customer':
      if (!id) return response.json({ error: 'Customer ID is required' }, { status: 400 });
      const customer = await server$RetrieveCustomer(id);
      return response.json({ data: customer });

    case 'subscription':
      if (!id) return response.json({ error: 'Subscription ID is required' }, { status: 400 });
      const subscription = await server$RetrieveSubscription(id);
      return response.json({ data: subscription });

    case 'checkout':
      if (!id) return response.json({ error: 'Checkout ID is required' }, { status: 400 });
      const checkout = await server$RetrieveCheckout(id);
      return response.json({ data: checkout });

    default:
      return response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}

async function handlePost(request: RequestLike, response: ResponseLike): Promise<ResponseLike> {
  const body = await request.json();
  const { resource, ...params } = body;

  if (!resource) {
    return response.json({ error: 'Resource type is required' }, { status: 400 });
  }

  switch (resource) {
    case 'customer':
      const customer = await server$CreateCustomer(params);
      return response.json({ data: customer });

    case 'checkout':
      const checkout = await server$CreateCheckout({ paymentUrl: params.paymentUrl || 'http://localhost:3001' }, params);
      return response.json({ data: checkout });

    case 'webhook':
      const webhookResult = await server$HandleWebhook({ body: JSON.stringify(params), headers: request.headers, webhookSecret: 'local-dev-secret' });
      return response.json({ data: webhookResult });

    default:
      return response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}

async function handlePut(request: RequestLike, response: ResponseLike): Promise<ResponseLike> {
  const body = await request.json();
  const { resource, id, ...params } = body;

  if (!resource || !id) {
    return response.json({ error: 'Resource type and ID are required' }, { status: 400 });
  }

  switch (resource) {
    case 'customer':
      const customer = await server$UpdateCustomer(id, params);
      return response.json({ data: customer });

    case 'subscription':
      const subscription = await server$UpdateSubscriptionHelper(id, params);
      return response.json({ data: subscription });

    default:
      return response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}

async function handleDelete(url: URL, response: ResponseLike): Promise<ResponseLike> {
  const resource = url.searchParams.get('resource');
  const id = url.searchParams.get('id');

  if (!resource || !id) {
    return response.json({ error: 'Resource type and ID are required' }, { status: 400 });
  }

  switch (resource) {
    case 'subscription':
      const subscription = await server$UpdateSubscriptionHelper(id, { status: 'canceled' });
      return response.json({ data: subscription });

    default:
      return response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}
