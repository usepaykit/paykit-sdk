import { LocalProvider, LocalConfig } from './local-provider';

export const createLocal = (config: LocalConfig) => {
  return new LocalProvider(config);
};

export const local = () => {
  const webhookUrl = process.env.PAYKIT_WEBHOOK_URL;
  const paymentUrl = process.env.PAYKIT_PAYMENT_URL;

  if (!webhookUrl || !paymentUrl) throw new Error('PAYKIT_WEBHOOK_URL and PAYKIT_PAYMENT_URL must be set');

  return createLocal({ debug: true, webhookUrl, paymentUrl });
};
