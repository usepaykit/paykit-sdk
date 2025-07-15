import { logger, ValidationError } from '@paykit-sdk/core';
import {
  server$CreateCheckout,
  server$CreateCustomer,
  server$HandleWebhook,
  server$RetrieveCheckout,
  server$RetrieveCustomer,
  server$RetrieveSubscription,
  server$UpdateCustomer,
  server$UpdateSubscriptionHelper,
} from '../server';
import { extractParams } from '../utils';

/**
 * Types for creating a basic Vite plugin, extracted from vite 7.0.4
 */
interface ViteDevServer {
  middlewares: {
    use(path: string, handler: (req: any, res: any, next?: () => void) => void): void;
  };
}

interface Plugin {
  name: string;
  configureServer?(server: ViteDevServer): void | (() => void) | Promise<void | (() => void)>;
  [key: string]: any;
}

export interface Local$VitePluginOptions {
  /**
   * API path prefix for the plugin routes
   * @default '/api/paykit'
   */
  prefix?: string;
}

export const local$VitePlugin = (options: Local$VitePluginOptions = {}): Plugin => {
  const { prefix = '/api/paykit' } = options;

  return {
    name: 'paykit-local-api-vite',
    configureServer(server) {
      server.middlewares.use(prefix, async (req, res) => {
        try {
          logger.info(`[PayKit] ${req.method} ${req.url}`);

          const url = new URL(req.url || '/', `http://localhost`);
          const method = req.method?.toLowerCase();

          const resource = url.searchParams.get('resource');
          const id = url.searchParams.get('id');
          const body = extractParams(url);

          if (!resource) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Resource type is required' }));
            return;
          }

          let result: any;

          switch (method) {
            case 'get':
              result = await handleGet(resource, id);
              break;
            case 'post':
              result = await handlePost(resource, body);
              break;
            case 'put':
              result = await handlePut(resource, id, body);
              break;
            case 'delete':
              result = await handleDelete(resource, id);
              break;
            default:
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ data: result }));
        } catch (error) {
          logger.error(`[PayKit] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

          if (error instanceof ValidationError) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: error.message }));
          } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        }
      });
    },
  };
};

async function handleGet(resource: string, id: string | null) {
  switch (resource) {
    case 'customer':
      if (!id) throw new ValidationError('Customer ID is required', {});
      return server$RetrieveCustomer(id);

    case 'subscription':
      if (!id) throw new ValidationError('Subscription ID is required', {});
      return server$RetrieveSubscription(id);

    case 'checkout':
      if (!id) throw new ValidationError('Checkout ID is required', {});
      return server$RetrieveCheckout(id);

    default:
      throw new ValidationError('Unknown resource type', {});
  }
}

async function handlePost(resource: string, body: any) {
  const { resource: _, ...params } = body;

  switch (resource) {
    case 'customer':
      return server$CreateCustomer(params);

    case 'checkout':
      const paymentUrl = params['paymentUrl'];

      if (!paymentUrl) throw new ValidationError('Payment URL is required', {});

      return server$CreateCheckout({ paymentUrl }, params);

    case 'webhook':
      return server$HandleWebhook(body);

    default:
      throw new ValidationError('Unknown resource type', {});
  }
}

async function handlePut(resource: string, id: string | null, body: any) {
  if (!id) throw new ValidationError('ID is required for updates', {});

  const { resource: _, id: __, ...params } = body;

  switch (resource) {
    case 'customer':
      return server$UpdateCustomer(id, params);

    case 'subscription':
      return server$UpdateSubscriptionHelper(id, params);

    default:
      throw new ValidationError('Unknown resource type', {});
  }
}

async function handleDelete(resource: string, id: string | null) {
  if (!id) throw new ValidationError('ID is required for deletion', {});

  switch (resource) {
    case 'subscription':
      return server$UpdateSubscriptionHelper(id, { status: 'canceled' });

    default:
      throw new ValidationError('Unknown resource type', {});
  }
}
