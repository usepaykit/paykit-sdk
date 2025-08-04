import type { Webhook } from '@paykit-sdk/core';
import { withLocalWebhook } from '@paykit-sdk/local/plugins';
import type { PluginOption } from 'vite';

export const createPaykitViteServer = (apiPath: string, name: string, methods: string[], webhook: Webhook): PluginOption => {
  return {
    name,
    configureServer: server => {
      server.middlewares.use(apiPath, async (req, res) => {
        const method = req.method?.toLowerCase() ?? '';

        if (!methods.includes(method)) {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: `Only ${methods.join(', ')} webhook requests are supported` }));
          return;
        }

        const result = await withLocalWebhook(req.originalUrl?.toString() ?? '', webhook);

        res.setHeader('Content-Type', 'application/json');

        res.end(JSON.stringify(result));
      });
    },
  };
};
