import { PaykitMetadata } from './metadata';

export type Invoice = {
  /**
   * The ID of the invoice.
   */
  id: string;

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
