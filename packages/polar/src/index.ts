import { PaykitProviderBaseWithAuthConfig } from '@paykit-sdk/core/src/types';
import { PolarProvider, PolarConfig } from './polar-provider';

export const createPolar = (config: PaykitProviderBaseWithAuthConfig<PolarConfig>) => {
  return new PolarProvider(config);
};

export const polar = () => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const isDev = process.env.NODE_ENV === 'development';

  if (!accessToken) throw new Error('POLAR_ACCESS_TOKEN is not set');

  return createPolar({ debug: true, accessToken, server: isDev ? 'sandbox' : 'production' });
};
