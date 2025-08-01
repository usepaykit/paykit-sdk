import { PayKit } from '@paykit-sdk/core';
import { local } from '@paykit-sdk/local';

export const provider = local();

export const paykit = new PayKit(provider);
