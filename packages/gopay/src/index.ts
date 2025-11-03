import { validateRequiredKeys } from '@paykit-sdk/core';
import { GoPayOptions, GoPayProvider } from './gopay-provider';

export const createGopay = (config: GoPayOptions) => {
  return new GoPayProvider(config);
};

export const gopay = () => {
  const envVars = validateRequiredKeys(
    [
      'GOPAY_CLIENT_ID',
      'GOPAY_CLIENT_SECRET',
      'GOPAY_GO_ID',
      'GOPAY_SANDBOX',
      'GOPAY_WEBHOOK_URL',
    ],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  return createGopay({
    clientId: envVars.GOPAY_CLIENT_ID,
    clientSecret: envVars.GOPAY_CLIENT_SECRET,
    goId: envVars.GOPAY_GO_ID,
    isSandbox: envVars.GOPAY_SANDBOX === 'true',
    webhookUrl: envVars.GOPAY_WEBHOOK_URL,
    debug: true,
  });
};
