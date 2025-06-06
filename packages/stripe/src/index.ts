import { StripeProvider, StripeConfig } from './stripe-provider';

const createStripe = (config: StripeConfig) => {
  return new StripeProvider(config);
};

export const stripe = () => {
  const apiKey = process.env.STRIPE_API_KEY;

  if (!apiKey) {
    throw new Error('STRIPE_API_KEY is not set');
  }

  return createStripe({ apiKey, apiVersion: '2025-05-28.basil' });
};
