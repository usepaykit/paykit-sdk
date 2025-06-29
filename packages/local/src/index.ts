import { LocalProvider, LocalConfig } from './local-provider';

export const createLocal = (config: LocalConfig) => {
  return new LocalProvider(config);
};

export const local = () => {
  return createLocal({ debug: true });
};

export * from './types';
export * from './utils';