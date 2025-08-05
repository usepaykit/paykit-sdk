import { validateEnvVars } from '@paykit-sdk/core';
import { GumroadProvider, GumroadConfig } from './gumroad-provider';

export const createGumroad = (config: GumroadConfig) => {
  return new GumroadProvider(config);
};

export const gumroad = () => {
  const envVars = validateEnvVars(['GUMROAD_ACCESS_TOKEN'], process.env);

  return createGumroad({ accessToken: envVars.GUMROAD_ACCESS_TOKEN, debug: true });
};
