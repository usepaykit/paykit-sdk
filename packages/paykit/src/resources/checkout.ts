import { StringMetadata } from '../types';

export type CreateCheckoutParams = {
  /**
   * The ID of the customer.
   */
  customer_id: string;
  /**
   * The metadata of the checkout.
   */
  metadata: StringMetadata;

  /**
   * The mode of the checkout.
   */
  mode: 'payment' | 'subscription';
  /**
   * The success URL of the checkout.
   */
  success_url: string;
  /**
   * The cancel URL of the checkout.
   */
  cancel_url: string;
  /**
   * The price ID of the checkout.
   */
  price_id: string;
  /**
   * The quantity of the checkout.
   */
  quantity: number;
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
   * The metadata of the checkout.
   */
  metadata?: StringMetadata;
  /**
   * The mode of the checkout.
   */
  mode: 'payment' | 'subscription';
  /**
   * The success URL of the checkout.
   */
  success_url: string;
  /**
   * The cancel URL of the checkout.
   */
  cancel_url: string | undefined;
  /**
   * The products of the checkout.
   */
  products: Array<{ id: string; quantity: number }>;
  /**
   * The URL of the checkout.
   */
  url: string;
};
