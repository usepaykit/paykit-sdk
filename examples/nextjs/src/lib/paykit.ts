import { PayKit } from '@paykit-sdk/core';
import { createLocal } from '@paykit-sdk/local';

export const provider = createLocal({ paymentUrl: 'http://localhost:3001', apiUrl: 'http://localhost:3000/api/paykit' });

export const paykit = new PayKit(provider);
