import { PayKit } from '@paykit-sdk/core';
import { createLocal } from '@paykit-sdk/local';

export const provider = createLocal({ paymentUrl: 'http://localhost:3001', apiUrl: '/api/paykit' });

export const paykit = new PayKit(provider);
