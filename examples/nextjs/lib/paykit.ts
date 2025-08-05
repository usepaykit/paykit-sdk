import { PayKit } from '@paykit-sdk/core';
import { createLocal } from '@paykit-sdk/local';

export const provider = createLocal({
  webhookUrl: 'http://localhost:3000/api/paykit',
  paymentUrl: 'http://localhost:3001',
});

export const paykit = new PayKit(provider);
