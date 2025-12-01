import { validateRequiredKeys } from '@paykit-sdk/core';
import { StripeProvider, StripeOptions } from './stripe-provider';

export const createStripe = (config: StripeOptions) => {
  return new StripeProvider(config);
};

export const stripe = () => {
  const envVars = validateRequiredKeys(
    ['STRIPE_API_KEY', 'PAYKIT_CLOUD_API_KEY'],
    (process.env as Record<string, string>) ?? { PAYKIT_CLOUD_API_KEY: '' },
    'Missing required environment variables: {keys}',
  );

  const isSandbox = process.env.NODE_ENV === 'development';

  return createStripe({
    apiKey: envVars.STRIPE_API_KEY,
    isSandbox,
    debug: isSandbox,
    apiVersion: '2025-07-30.basil',
    cloudApiKey: envVars.PAYKIT_CLOUD_API_KEY,
  });
};
