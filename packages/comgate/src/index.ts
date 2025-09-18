import { validateEnvVars } from '@paykit-sdk/core';
import { ComgateProvider, ComgateConfig } from './comgate-provider';

export const createComgate = (config: ComgateConfig) => {
  return new ComgateProvider(config);
};

export const comgate = () => {
  const envVars = validateEnvVars(['COMGATE_API_KEY'], process.env);

  const apiKey = envVars.COMGATE_API_KEY;

  return createComgate({ apiKey });
};
