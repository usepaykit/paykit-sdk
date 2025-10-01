import { validateRequiredKeys } from '@paykit-sdk/core';
import { StripeProvider, StripeConfig } from './stripe-provider';

export const createStripe = (config: StripeConfig) => {
  return new StripeProvider(config);
};

export const stripe = () => {
  const envVars = validateRequiredKeys(['STRIPE_API_KEY'], process.env, 'Missing required environment variables: {keys}');

  const isDev = process.env.NODE_ENV === 'development';

  return createStripe({ apiKey: envVars.STRIPE_API_KEY, debug: isDev, apiVersion: '2025-07-30.basil' });
};
