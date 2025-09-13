import { validateEnvVars } from '@paykit-sdk/core';
import { StellarOptions, StellarProvider } from './provider';

export const createStellar = (config: StellarOptions) => {
  return new StellarProvider(config);
};

export const stellar = () => {
  const envVars = validateEnvVars(['PAYKIT_API_KEY', 'PAYKIT_WEBHOOK_URL', 'PAYKIT_ASSET_CODES', 'PAYKIT_ASSET_ISSUER'], process.env);

  const apiKey = envVars.PAYKIT_API_KEY;
  const webhookUrl = envVars.PAYKIT_WEBHOOK_URL;
  const assetCodes = envVars.PAYKIT_ASSET_CODES.split(',');
  const assetIssuer = envVars.PAYKIT_ASSET_ISSUER;

  return createStellar({ apiKey, webhookUrl, assetCodes, assetIssuer });
};
