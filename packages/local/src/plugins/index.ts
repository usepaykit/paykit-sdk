import { Webhook } from '@paykit-sdk/core';
import { server$HandleWebhook } from '../server';

/**
 * @description Handles webhooks for the local provider by processing the URL and webhook instance.
 * Can be used with any framework that provides these parameters.
 */
export const withLocalWebhook = async (url: string, webhook: Webhook) => {
  return await server$HandleWebhook(url, webhook);
};
