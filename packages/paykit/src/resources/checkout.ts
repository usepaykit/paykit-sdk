import { z } from 'zod';
import { schema } from '../tools/utils';
import { Payee, payeeSchema } from './customer';
import { metadataSchema, PaykitMetadata } from './metadata';
import { ShippingInfo, shippingInfoSchema } from './shipping';
import { SubscriptionBillingInterval, subscriptionBillingIntervalSchema } from './subscription';

export interface CheckoutSubscription {
  /**
   * The billing interval.
   */
  billing_interval: SubscriptionBillingInterval;

  /**
   * The billing interval count.
   */
  billing_interval_count: number;
}

export const checkoutSubscriptionSchema = schema<CheckoutSubscription>()(
  z.object({
    billing_interval: subscriptionBillingIntervalSchema,
    billing_interval_count: z.number(),
  }),
);

export const billingModeSchema = z.enum(['one_time', 'recurring']);

export type BillingMode = z.infer<typeof billingModeSchema>;

export interface Checkout {
  /**
   * The ID of the checkout.
   */
  id: string;

  /**
   * The payee of the checkout.
   */
  customer: Payee;

  /**
   * The payment URL of the checkout.
   */
  payment_url: string;

  /**
   * The metadata of the checkout.
   */
  metadata: PaykitMetadata | null;

  /**
   * The mode of the checkout.
   */
  session_type: BillingMode;

  /**
   * The products of the checkout.
   */
  products: Array<{ id: string; quantity: number }>;

  /**
   * The currency of the checkout.
   */
  currency: string;

  /**
   * The amount of the checkout.
   */
  amount: number;

  /**
   * The subscription specification of the checkout.
   */
  subscription?: CheckoutSubscription | null;
}

export const checkoutSchema = schema<Checkout>()(
  z.object({
    id: z.string(),
    customer: payeeSchema,
    payment_url: z.string(),
    metadata: metadataSchema.nullable(),
    session_type: billingModeSchema,
    products: z.array(z.object({ id: z.string(), quantity: z.number() })),
    currency: z.string(),
    amount: z.number(),
    subscription: checkoutSubscriptionSchema.nullable().optional(),
  }),
);

interface CreateCheckoutBaseSchema extends Pick<Checkout, 'customer' | 'metadata'> {
  /**
   * The item ID of the checkout.
   */
  item_id: string;

  /**
   * The quantity of the checkout.
   */
  quantity: number;

  /**
   * Extra information to be sent to the provider e.g tax, trial days, etc.
   */
  provider_metadata?: Record<string, unknown>;

  /**
   * The shipping information of the checkout.
   */
  shipping_info?: ShippingInfo;
}

export interface CreateOneTimeCheckoutSchema extends CreateCheckoutBaseSchema {
  /**
   * The session type of the checkout.
   */
  session_type: typeof billingModeSchema.enum.one_time;

  /**
   * The subscription specification of the checkout.
   */
  subscription?: CheckoutSubscription;
}

export interface CreateRecurringCheckoutSchema extends CreateCheckoutBaseSchema {
  /**
   * The session type of the checkout.
   */
  session_type: typeof billingModeSchema.enum.recurring;

  /**
   * The subscription specification of the checkout.
   */
  subscription: CheckoutSubscription;
}

export type CreateCheckoutSchema = CreateOneTimeCheckoutSchema | CreateRecurringCheckoutSchema;

export const createCheckoutSchema = schema<CreateCheckoutSchema>()(
  z.object({
    customer: payeeSchema,
    metadata: metadataSchema.nullable(),
    session_type: z.literal(billingModeSchema.enum.one_time),
    item_id: z.string(),
    quantity: z.number(),
    subscription: checkoutSubscriptionSchema.optional(),
    provider_metadata: z.record(z.string(), z.unknown()).optional(),
    shipping_info: shippingInfoSchema.optional(),
  }),
);

export type UpdateCheckoutSchema = Partial<CreateCheckoutSchema>;

export const updateCheckoutSchema = createCheckoutSchema.partial();

export interface RetrieveCheckoutParams {
  id: string;
}

export const retrieveCheckoutSchema = schema<RetrieveCheckoutParams>()(
  z.object({
    id: z.string(),
  }),
);
