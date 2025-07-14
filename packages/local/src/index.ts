import { LocalProvider, LocalConfig } from './local-provider';

export const createLocal = (config: LocalConfig) => {
  return new LocalProvider(config);
};

export const local = () => {
  return createLocal({ debug: true, apiUrl: 'http://localhost:3000/api/paykit', paymentUrl: 'http://localhost:3001' });
};

export * from './tools';
