import { validateEnvVars } from '@paykit-sdk/core';
import { StripeProvider, StripeConfig } from './stripe-provider';

export const createStripe = (config: StripeConfig) => {
  return new StripeProvider(config);
};

export const stripe = () => {
  const envVars = validateEnvVars(['STRIPE_API_KEY'], process.env);

  const isDev = process.env.NODE_ENV === 'development';

  return createStripe({ apiKey: envVars.STRIPE_API_KEY, debug: isDev, apiVersion: '2025-07-30.basil' });
};
