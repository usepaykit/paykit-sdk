import { WithPaymentProviderConfig } from '@paykit-sdk/core/src/types';
import { PolarProvider, PolarConfig } from './polar-provider';

export const createPolar = (config: WithPaymentProviderConfig<PolarConfig>) => {
  return new PolarProvider(config);
};

export const polar = () => {
  const apiKey = process.env.POLAR_ACCESS_TOKEN;
  const isDev = process.env.NODE_ENV === 'development';

  if (!apiKey) throw new Error('POLAR_ACCESS_TOKEN is not set');

  return createPolar({ apiKey, environment: isDev ? 'test' : 'live' });
};
