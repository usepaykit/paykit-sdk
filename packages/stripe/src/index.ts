import { StripeProvider, StripeConfig } from './stripe-provider';

export const createStripe = (config: StripeConfig) => {
  return new StripeProvider(config);
};

export const stripe = () => {
  const apiKey = process.env.STRIPE_API_KEY;
  const isDev = process.env.NODE_ENV === 'development';

  if (!apiKey) {
    throw new Error('STRIPE_API_KEY is not set');
  }

  return createStripe({ apiKey, debug: isDev, apiVersion: '2025-05-28.basil' });
};
