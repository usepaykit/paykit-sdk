import { validateRequiredKeys } from '@paykit-sdk/core';
import { PolarProvider, PolarOptions } from './polar-provider';

export const createPolar = (config: PolarOptions) => {
  return new PolarProvider(config);
};

export const polar = () => {
  const envVars = validateRequiredKeys(
    ['POLAR_ACCESS_TOKEN'],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  const isDev = process.env.NODE_ENV === 'development';

  return createPolar({ debug: true, accessToken: envVars.POLAR_ACCESS_TOKEN, server: isDev ? 'sandbox' : 'production' });
};
