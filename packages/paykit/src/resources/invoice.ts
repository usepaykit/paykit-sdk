import { z } from 'zod';
import { billingModeSchema } from './checkout';
import { metadataSchema } from './metadata';

const invoiceStatus = z.enum(['paid', 'open']);

export type InvoiceStatus = z.infer<typeof invoiceStatus>;

export const invoiceSchema = z.object({
  /**
   * The ID for the invoice
   */
  id: z.string(),

  /**
   * Customer ID linked to the invoice.
   */
  customer_id: z.string(),

  /**
   * Subscription ID, if recurring (null for one-time).
   */
  subscription_id: z.string().nullable(),

  /**
   * Billing mode: one-time or recurring.
   */
  billing_mode: billingModeSchema,

  /**
   * Amount paid in smallest currency unit (e.g., cents).
   */
  amount_paid: z.number(),

  /**
   * ISO 4217 currency code (e.g., USD, EUR).
   */
  currency: z.string(),

  /**
   * Invoice status.
   */
  status: invoiceStatus,

  /**
   * Date the invoice was paid (ISO 8601 string, null if unpaid).
   */
  paid_at: z.string(),

  /**
   * Line items of the invoice.
   */
  line_items: z.array(z.object({ id: z.string(), quantity: z.number() })).nullable(),

  /**
   * Metadata for provider-specific or custom data.
   */
  metadata: metadataSchema.nullable().optional(),

  /**
   * The provider custom field
   */
  custom_fields: z.record(z.string(), z.any()).nullable(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
