import { validateRequiredKeys } from '@paykit-sdk/core';
import { PolarProvider, PolarOptions } from './polar-provider';

export const createPolar = (config: PolarOptions) => {
  return new PolarProvider(config);
};

export const polar = () => {
  const envVars = validateRequiredKeys(
    ['POLAR_ACCESS_TOKEN', 'POLAR_SANDBOX', 'PAYKIT_CLOUD_API_KEY'],
    (process.env as Record<string, string>) ?? { PAYKIT_CLOUD_API_KEY: '' },
    'Missing required environment variables: {keys}',
  );

  return createPolar({
    debug: true,
    accessToken: envVars.POLAR_ACCESS_TOKEN,
    isSandbox: envVars.POLAR_SANDBOX == 'true',
    cloudApiKey: envVars.PAYKIT_CLOUD_API_KEY,
  });
};
