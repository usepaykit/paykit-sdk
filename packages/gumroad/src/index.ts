import { GumroadProvider, GumroadConfig } from './gumroad-provider';

export const createGumroad = (config: GumroadConfig) => {
  return new GumroadProvider(config);
};

export const gumroad = () => {
  const accessToken = process.env.GUMROAD_ACCESS_TOKEN;

  if (!accessToken) throw new Error('GUMROAD_ACCESS_TOKEN is not set');

  return createGumroad({ accessToken, debug: true });
};
