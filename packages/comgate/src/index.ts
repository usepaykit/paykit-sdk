import { validateEnvVars } from '@paykit-sdk/core';
import { ComgateProvider, ComgateConfig } from './comgate-provider';

export const createComgate = (config: ComgateConfig) => {
  return new ComgateProvider(config);
};

export const comgate = () => {
  const envVars = validateEnvVars(['COMGATE_MERCHANT', 'COMGATE_SECRET', 'COMGATE_BASE_URL', 'COMGATE_SANDBOX'], process.env);

  const merchant = envVars.COMGATE_MERCHANT;
  const secret = envVars.COMGATE_SECRET;
  const baseUrl = envVars.COMGATE_BASE_URL;
  const sandbox = envVars.COMGATE_SANDBOX === 'true';

  return createComgate({ merchant, secret, baseUrl, sandbox });
};
