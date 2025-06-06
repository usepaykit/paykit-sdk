export type CreateCheckoutParams = {
  customer_id: string;
  metadata: Record<string, string>;
  mode: 'payment' | 'subscription';
  success_url: string;
  cancel_url: string;
  price_id: string;
  quantity: number;
};

export type RetrieveCheckoutParams = {
  customer_id: string;
};

export type Checkout = {
  id: string;
  customer_id: string;
  metadata?: Record<string, string>;
  mode: 'payment' | 'subscription';
  success_url: string;
  cancel_url: string | undefined;
  products: Array<{ id: string; quantity: number }>;
  url: string;
};
