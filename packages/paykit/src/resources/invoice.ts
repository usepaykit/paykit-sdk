import { z } from 'zod';
import { BillingMode } from './checkout';
import { PaykitMetadata } from './metadata';

export const invoiceStatusSchema = z.enum(['draft', 'paid', 'refunded']);

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export type Invoice = {
  /**
   * The ID of the invoice.
   */
  id: string;

  /**
   * The billing mode of the invoice.
   */
  billing_mode: BillingMode;

  /**
   * The amount paid in smallest currency unit.
   */
  amount_paid: number;

  /**
   * The status of the invoice.
   */
  status: InvoiceStatus;

  /**
   * ISO 4217 currency code (e.g. USD, EUR, GBP, etc.)
   */
  currency: string;

  /**
   * The date the invoice was paid.
   */
  paid_at: string | null;

  /**
   * The line items of the invoice.
   */
  line_items: Array<{ id: string; quantity: number }>;

  /**
   * The customer reference.
   */
  customer_id: string;

  /**
   * Linked subscription (if recurring).
   */
  subscription_id: string | null;

  /**
   * The current cycle number in subscription.
   */
  current_cycle: number;

  /**
   * The total cycles completed.
   */
  total_cycles: number;

  /**
   * The metadata of the invoice.
   */
  metadata: PaykitMetadata;
};
