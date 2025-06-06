import { WithPaymentProviderConfig } from '../../paykit/src/types';
import { PolarProvider, PolarConfig } from './polar-provider';

const createPolar = (config: WithPaymentProviderConfig<PolarConfig>) => {
  return new PolarProvider(config);
};

export const polar = () => {
  const apiKey = process.env.POLAR_API_KEY;

  if (!apiKey) throw new Error('POLAR_ACCESS_TOKEN is not set');

  return createPolar({ apiKey, environment: 'test' });
};
