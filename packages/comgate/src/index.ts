import { validateRequiredKeys } from '@paykit-sdk/core';
import { ComgateProvider, ComgateOptions } from './comgate-provider';

export const createComgate = (opts: ComgateOptions) => {
  return new ComgateProvider(opts);
};

export const comgate = () => {
  const envVars = validateRequiredKeys(
    ['COMGATE_MERCHANT', 'COMGATE_SECRET', 'COMGATE_SANDBOX'],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  const merchant = envVars.COMGATE_MERCHANT;
  const secret = envVars.COMGATE_SECRET;
  const isSandbox = envVars.COMGATE_SANDBOX === 'true';

  return createComgate({ merchant, secret, isSandbox });
};
