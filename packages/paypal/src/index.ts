import { validateEnvVars } from '@paykit-sdk/core';
import { PayPalProvider, PayPalConfig } from './paypal-provider';

export const createPaypal = (config: PayPalConfig) => {
  return new PayPalProvider(config);
};

export const paypal = () => {
  const envVars = validateEnvVars(['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_AUTH_WEBHOOK_ID'] as const, process.env);

  const isSandbox = process.env.NODE_ENV === 'development';

  return createPaypal({
    clientId: envVars.PAYPAL_CLIENT_ID,
    clientSecret: envVars.PAYPAL_CLIENT_SECRET,
    authWebhookId: envVars.PAYPAL_AUTH_WEBHOOK_ID,
    sandbox: isSandbox,
  });
};
