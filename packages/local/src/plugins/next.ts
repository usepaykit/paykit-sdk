import { Webhook } from '@paykit-sdk/core';
import { server$HandleWebhook } from '../server';

export const withNextJsWebhook = async (url: string, webhook: Webhook) => {
  return await server$HandleWebhook(url, webhook);
};
