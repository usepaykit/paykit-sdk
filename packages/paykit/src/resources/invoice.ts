import { BillingMode } from './checkout';
import { PaykitMetadata } from './metadata';

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
   * The amount of the invoice.
   */
  amount: number;

  /**
   * The currency of the invoice.
   */
  currency: string;

  /**
   * The metadata of the invoice.
   */
  metadata: PaykitMetadata;

  /**
   * The customer ID of the invoice.
   */
  customer_id: string;
};
