import { validateRequiredKeys } from '@paykit-sdk/core';
import { PayPalConfig, PayPalProvider } from './paypal-provider';

export const paypal = () => {
  const envVars = validateRequiredKeys(
    ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_IS_SANDBOX'],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  return new PayPalProvider({
    clientId: envVars.PAYPAL_CLIENT_ID,
    clientSecret: envVars.PAYPAL_CLIENT_SECRET,
    isSandbox: envVars.PAYPAL_IS_SANDBOX === 'true',
  });
};

export const createPayPal = (config: PayPalConfig) => {
  return new PayPalProvider(config);
};
