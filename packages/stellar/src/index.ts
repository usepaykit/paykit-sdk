import { validateRequiredKeys } from '@paykit-sdk/core';
import { StellarOptions, StellarProvider } from './provider';

export const createStellar = (config: StellarOptions) => {
  return new StellarProvider(config);
};

export const stellar = () => {
  const envVars = validateRequiredKeys(
    ['PAYKIT_API_KEY', 'PAYKIT_WEBHOOK_URL', 'STELLAR_ASSETS'],
    process.env,
    'Missing required environment variables: {keys}',
  );

  const apiKey = envVars.PAYKIT_API_KEY;
  const webhookUrl = envVars.PAYKIT_WEBHOOK_URL;
  const assets = envVars.STELLAR_ASSETS.split(',').map(asset => ({ issuer: asset.split(':')[1], code: asset.split(':')[0] })); // e.g. USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJIKDPUX67P4

  return createStellar({ apiKey, webhookUrl, assets });
};
