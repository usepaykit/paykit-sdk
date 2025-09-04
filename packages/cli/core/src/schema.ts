import { checkoutSchema, customerSchema, subscriptionSchema, invoiceSchema } from '@paykit-sdk/core';
import { z } from 'zod';

const productSchema = z.object({ name: z.string(), description: z.string(), price: z.string(), currency: z.string() });

export const configSchema = z.object({
  product: productSchema,
  customer: customerSchema,
  devServerPort: z.number().optional(),
  subscriptions: z.array(subscriptionSchema),
  checkouts: z.array(checkoutSchema),
  invoices: z.array(invoiceSchema),
});

export type PaykitConfig = z.infer<typeof configSchema>;
