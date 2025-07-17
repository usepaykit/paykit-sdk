import { ValidationError, logger } from '@paykit-sdk/core';
import {
  server$CreateCustomer,
  server$GetCustomer,
  server$PutCustomer,
  server$CreateCheckout,
  server$GetCheckout,
  server$GetSubscription,
  server$UpdateSubscriptionHelper,
  server$HandleWebhook,
} from '../server';
import { extractParams } from '../utils';

export interface RequestLike {
  method?: string;
  url: string;
  headers: any;
  json(): Promise<any>;
}

export async function local$NextPlugin(request: RequestLike): Promise<any> {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Remove local$NextPlugin() from your API route before deploying');
    return Response.json({ error: 'Local plugin not allowed in production. Remove local$NextPlugin() from your API routes.' }, { status: 500 });
  }

  try {
    const method = request.method?.toLowerCase();
    const url = new URL(request.url);

    if (method === 'get') {
      return await handleGet(url);
    } else if (method === 'post') {
      return await handlePost(request);
    } else if (method === 'put') {
      return await handlePut(request);
    } else if (method === 'delete') {
      return await handleDelete(url);
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.log({ error });
    logger.error('Local plugin error');

    if (error instanceof ValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGet(url: URL): Promise<Response> {
  const resource = url.searchParams.get('resource');
  const id = url.searchParams.get('id');

  if (!resource) {
    return Response.json({ error: 'Resource type is required' }, { status: 400 });
  }

  switch (resource) {
    case 'customer':
      if (!id) return Response.json({ error: 'Customer ID is required' }, { status: 400 });
      const customer = await server$GetCustomer(id);
      return Response.json(customer);

    case 'subscription':
      if (!id) return Response.json({ error: 'Subscription ID is required' }, { status: 400 });
      const subscription = await server$GetSubscription(id);
      return Response.json(subscription);

    case 'checkout':
      if (!id) return Response.json({ error: 'Checkout ID is required' }, { status: 400 });
      const checkout = await server$GetCheckout(id);
      return Response.json(checkout);

    default:
      return Response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}

async function handlePost(request: RequestLike): Promise<Response> {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');
  const params = extractParams(url);

  if (!resource) {
    return Response.json({ error: 'Resource type is required' }, { status: 400 });
  }

  switch (resource) {
    case 'customer':
      const customer = await server$CreateCustomer(params);
      return Response.json(customer);

    case 'checkout':
      const checkout = await server$CreateCheckout(params);
      return Response.json(checkout);

    case 'webhook':
      const webhookResult = await server$HandleWebhook({ body: JSON.stringify(params), headers: request.headers, webhookSecret: 'local-dev-secret' });
      return Response.json(webhookResult);

    default:
      return Response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}

async function handlePut(request: RequestLike): Promise<Response> {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');
  const id = url.searchParams.get('id');
  const params = extractParams(url);

  if (!resource || !id) {
    return Response.json({ error: 'Resource type and ID are required' }, { status: 400 });
  }

  switch (resource) {
    case 'customer':
      const customer = await server$PutCustomer({ ...params, id });
      return Response.json(customer);

    case 'subscription':
      const subscription = await server$UpdateSubscriptionHelper(id, params);
      return Response.json(subscription);

    default:
      return Response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}

async function handleDelete(url: URL): Promise<Response> {
  const resource = url.searchParams.get('resource');
  const id = url.searchParams.get('id');

  if (!resource || !id) {
    return Response.json({ error: 'Resource type and ID are required' }, { status: 400 });
  }

  switch (resource) {
    case 'subscription':
      const subscription = await server$UpdateSubscriptionHelper(id, { status: 'canceled' });
      return Response.json(subscription);

    default:
      return Response.json({ error: 'Unknown resource type' }, { status: 400 });
  }
}
