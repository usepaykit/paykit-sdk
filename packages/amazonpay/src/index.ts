import { validateRequiredKeys } from '@paykit-sdk/core';
import { AmazonPayOptions, AmazonPayProvider } from './amazonpay-provider';

export const createAmazonPay = (opts: AmazonPayOptions) => {
  return new AmazonPayProvider(opts);
};

export const amazonpay = () => {
  const envVars = validateRequiredKeys(
    [
      'AMAZON_ACCESS_TOKEN',
      'AMAZON_CLIENT_ID',
      'AMAZON_CLIENT_SECRET',
      'AMAZON_REGION',
      'AMAZON_MERCHANT_ID',
      'AMAZON_STORE_ID',
      'AMAZON_PUBLIC_KEY_ID',
      'AMAZON_PRIVATE_KEY',
      'AMAZON_ALGORITHM',
    ],
    process.env as Record<string, string>,
    'Missing required environment variables: {keys}',
  );

  return createAmazonPay({
    merchantId: envVars.AMAZON_MERCHANT_ID,
    storeId: envVars.AMAZON_STORE_ID,
    region: envVars.AMAZON_REGION as 'us' | 'na' | 'eu' | 'uk' | 'de' | 'jp',
    publicKeyId: envVars.AMAZON_PUBLIC_KEY_ID,
    privateKey: envVars.AMAZON_PRIVATE_KEY,
    algorithm: envVars.AMAZON_ALGORITHM as 'AMZN-PAY-RSASSA-PSS' | 'AMZN-PAY-RSASSA-PSS-V2',
  });
};
