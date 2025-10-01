import { validateRequiredKeys } from '@paykit-sdk/core';
import { GumroadProvider, GumroadConfig } from './gumroad-provider';

export const createGumroad = (config: GumroadConfig) => {
  return new GumroadProvider(config);
};

export const gumroad = () => {
  const envVars = validateRequiredKeys(['GUMROAD_ACCESS_TOKEN'], process.env, 'Missing required environment variables: {key}');

  return createGumroad({ accessToken: envVars.GUMROAD_ACCESS_TOKEN, debug: true });
};
