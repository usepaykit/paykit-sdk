import { validateRequiredKeys } from '@paykit-sdk/core';
import { MonnifyOptions, MonnifyProvider } from './monnify-provider';

export const createMonnify = (config: MonnifyOptions) => {
  return new MonnifyProvider(config);
};

export const monnify = () => {
  const envVars = validateRequiredKeys(
    ['MONNIFY_PUBLIC_KEY', 'MONNIFY_SECRET_KEY', 'MONNIFY_SANDBOX'],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  return createMonnify({
    publicKey: envVars.MONNIFY_PUBLIC_KEY,
    secretKey: envVars.MONNIFY_SECRET_KEY,
    isSandbox: envVars.MONNIFY_SANDBOX === 'true',
  });
};
