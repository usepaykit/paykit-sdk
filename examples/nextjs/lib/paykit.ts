import { PayKit } from '@paykit-sdk/core';
import { stripe } from '@paykit-sdk/stripe';

export const provider = stripe();

export const paykit = new PayKit(provider);
