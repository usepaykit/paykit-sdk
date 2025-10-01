import { validateRequiredKeys } from '@paykit-sdk/core';
import { LocalProvider, LocalConfig } from './local-provider';

export const createLocal = (config: LocalConfig) => {
  return new LocalProvider(config);
};

export const local = () => {
  const envVars = validateRequiredKeys(['PAYKIT_WEBHOOK_URL', 'PAYKIT_PAYMENT_URL'], process.env, 'Missing required environment variables: {keys}');

  return createLocal({ debug: true, webhookUrl: envVars.PAYKIT_WEBHOOK_URL, paymentUrl: envVars.PAYKIT_PAYMENT_URL });
};
