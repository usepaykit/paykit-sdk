import { PaykitMetadata } from '../types';

/**
 * @internal
 * Some important notes for the checkout resource:
 * item_id -> price_id(stripe) -> plan_code(paystack) -> order_id(square) -> reference(ayden)
 * session_type -> mode(stripe) -> transaction_type(paystack) -> payment_type(square) -> recurring(ayden)
 * payment_url -> url(stripe) -> authorization_url(paystack) -> checkout_url(square) -> redirect_url(ayden)
 */

export type CheckoutSessionType = 'one_time' | 'recurring';

export type CreateCheckoutParams = {
  /**
   * The ID of the customer.
   */
  customer_id: string;

  /**
   * The metadata of the checkout.
   */
  metadata: PaykitMetadata;

  /**
   * The mode of the checkout.
   */
  session_type: CheckoutSessionType;

  /**
   * The item ID of the checkout.
   */
  item_id: string;

  /**
   * Extra information to be sent to the provider e.g tax, trial days, etc.
   */
  provider_metadata?: Record<string, unknown>;
};

export type RetrieveCheckoutParams = {
  /**
   * The ID of the customer.
   */
  customer_id: string;
};

export type Checkout = {
  /**
   * The ID of the checkout.
   */
  id: string;

  /**
   * The ID of the customer.
   */
  customer_id: string;

  /**
   * The payment URL where customer completes the transaction.
   */
  payment_url: string;

  /**
   * The metadata of the checkout.
   */
  metadata: PaykitMetadata | null;

  /**
   * The mode of the checkout.
   */
  session_type: CheckoutSessionType;

  /**
   * The products of the checkout.
   */
  products: Array<{ id: string; quantity: number }>;

  /**
   * The currency code (ISO 4217).
   */
  currency: string;

  /**
   * Total amount in the smallest currency unit (e.g., cents).
   */
  amount: number;
};
