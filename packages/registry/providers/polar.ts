import { PayKit, createEndpointHandlers } from '@paykit-sdk/core';
import { polar } from '@paykit-sdk/polar';

export const paykit = new PayKit(polar());
export const endpoints = createEndpointHandlers(paykit);
