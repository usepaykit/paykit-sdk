import { LocalProvider, LocalConfig } from './local-provider';

export const createLocal = (config: LocalConfig) => {
  return new LocalProvider(config);
};

export const local = () => {
  return createLocal({ debug: true, baseUrl: 'http://localhost:3000', paymentUrl: 'http://localhost:3000/checkout' });
};

export * from './types';
export * from './utils';
export * from './tools';
