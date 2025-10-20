import { PayKit, createEndpointHandlers } from '@paykit-sdk/core';
import { createPolar } from '@paykit-sdk/polar';

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error('POLAR_ACCESS_TOKEN is not set');
}

const provider = createPolar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  isSandbox: false,
});

const paykit = new PayKit(provider);
export const endpoints = createEndpointHandlers(paykit);

export { paykit, provider };
