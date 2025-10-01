import { validateRequiredKeys } from '@paykit-sdk/core';
import { WithoutProviderSDK, WithoutProviderSDKOptions } from './provider';

export const createWithoutProviderSDK = (config: WithoutProviderSDKOptions) => {
  return new WithoutProviderSDK(config);
};

export const withoutProviderSDK = () => {
  const envVars = validateRequiredKeys(['PROVIDER_API_KEY'], process.env, 'Missing required environment variables: {keys}');

  const apiKey = envVars.PROVIDER_API_KEY;

  return createWithoutProviderSDK({ apiKey });
};
