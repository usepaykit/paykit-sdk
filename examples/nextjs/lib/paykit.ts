import { PayKit } from '@paykit-sdk/core';
import { polar } from '@paykit-sdk/polar';

export const provider = polar();

export const paykit = new PayKit(provider);
