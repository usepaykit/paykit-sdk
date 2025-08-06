import { validateEnvVars } from '@paykit-sdk/core';
import { WithoutProviderSDK, WithoutProviderSDKOptions } from './provider';

export const createWithoutProviderSDK = (config: WithoutProviderSDKOptions) => {
  return new WithoutProviderSDK(config);
};

export const withoutProviderSDK = () => {
  const envVars = validateEnvVars(['PROVIDER_API_KEY'], process.env);

  const apiKey = envVars.PROVIDER_API_KEY;

  return createWithoutProviderSDK({ apiKey });
};
