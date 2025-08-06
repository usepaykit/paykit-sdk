import { validateEnvVars } from '@paykit-sdk/core';
import { WithProviderSDK, WithProviderSDKOptions } from './provider';

export const createWithProviderSDK = (config: WithProviderSDKOptions) => {
  return new WithProviderSDK(config);
};

export const withProviderSDK = () => {
  const envVars = validateEnvVars(['PROVIDER_API_KEY'], process.env);

  const apiKey = envVars.PROVIDER_API_KEY;

  return createWithProviderSDK({ apiKey });
};
