import { PayKit } from '@paykit-sdk/core';
import { createPolar } from '@paykit-sdk/polar';

const provider = createPolar({ accessToken: process.env.POLAR_ACCESS_TOKEN, server: 'production' });

export const paykit = new PayKit(provider);
