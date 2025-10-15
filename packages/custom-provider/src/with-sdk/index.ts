import { validateRequiredKeys } from '@paykit-sdk/core';
import { WithProviderSDK, WithProviderSDKOptions } from './provider';

export const createWithProviderSDK = (config: WithProviderSDKOptions) => {
  return new WithProviderSDK(config);
};

export const withProviderSDK = () => {
  const envVars = validateRequiredKeys(
    ['PROVIDER_API_KEY'],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  const apiKey = envVars.PROVIDER_API_KEY;

  return createWithProviderSDK({ apiKey });
};
