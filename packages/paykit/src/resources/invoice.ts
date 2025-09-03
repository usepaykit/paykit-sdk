import { z } from 'zod';
import { BillingMode } from './checkout';
import { PaykitMetadata } from './metadata';

const invoiceStatus = z.enum(['paid', 'open']);

export type InvoiceStatus = z.infer<typeof invoiceStatus>;

export interface Invoice {
  /**
   * The ID for the invoice
   */
  id: string;

  /**
   * Customer ID linked to the invoice.
   */
  customer_id: string;

  /**
   * Subscription ID, if recurring (null for one-time).
   */
  subscription_id: string | null;

  /**
   * Billing mode: one-time or recurring.
   */
  billing_mode: BillingMode;

  /**
   * Amount paid in smallest currency unit (e.g., cents).
   */
  amount_paid: number;

  /**
   * ISO 4217 currency code (e.g., USD, EUR).
   */
  currency: string;

  /**
   * Invoice status.
   */
  status: InvoiceStatus;

  /**
   * Date the invoice was paid (ISO 8601 string, null if unpaid).
   */
  paid_at: string;

  /**
   * Line items of the invoice.
   */
  line_items: Array<{ id: string; quantity: number }> | null;

  /**
   * Metadata for provider-specific or custom data.
   */
  metadata: PaykitMetadata | null;
}
