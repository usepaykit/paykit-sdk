import { Webhook } from '@paykit-sdk/core';
import { server$HandleWebhook } from '../server';

/**
 * Generic webhook handler for the local provider
 * Works with any framework that can pass a URL and webhook instance
 */
export const withLocalWebhook = async (url: string, webhook: Webhook) => {
  return await server$HandleWebhook(url, webhook);
};
