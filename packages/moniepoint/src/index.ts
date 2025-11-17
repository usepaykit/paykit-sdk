import { validateRequiredKeys } from '@paykit-sdk/core';
import { MoniepointOptions, MoniepointProvider } from './moniepoint-provider';

export const createMoniepoint = (config: MoniepointOptions) => {
  return new MoniepointProvider(config);
};

export const moniepoint = () => {
  const envVars = validateRequiredKeys(
    ['MONIEPOINT_PUBLIC_KEY', 'MONIEPOINT_SECRET_KEY', 'MONIEPOINT_SANDBOX'],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  return createMoniepoint({
    publicKey: envVars.MONIEPOINT_PUBLIC_KEY,
    secretKey: envVars.MONIEPOINT_SECRET_KEY,
    isSandbox: envVars.MONIEPOINT_SANDBOX === 'true',
  });
};
