import { z } from 'zod';
import { schema } from '../tools';
import { Payee, payeeSchema } from './customer';
import { metadataSchema, PaykitMetadata } from './metadata';

export const subscriptionBillingIntervalSchema = z.enum(['day', 'week', 'month', 'year']);

export type SubscriptionBillingInterval = z.infer<
  typeof subscriptionBillingIntervalSchema
>;

export const subscriptionStatusSchema = z.enum([
  'active',
  'past_due',
  'canceled',
  'expired',
  'pending',
]);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export interface Subscription {
  /**
   * The unique identifier of the subscription.
   */
  id: string;

  /**
   * The payee linked to the subscription.
   */
  customer: Payee;

  /**
   * The amount of the subscription.
   */
  amount: number;

  /**
   * The currency of the subscription.
   */
  currency: string;

  /**
   * The status of the subscription.
   */
  status: SubscriptionStatus;

  /**
   * The start of the current billing period.
   */
  current_period_start: Date;

  /**
   * The end of the current billing period.
   */
  current_period_end: Date;

  /**
   * The item ID of the subscription.
   */
  item_id: string;

  /**
   * The billing interval of the subscription.
   */
  billing_interval: SubscriptionBillingInterval;

  /**
   * The metadata of the subscription.
   */
  metadata: PaykitMetadata | null;

  /**
   * The custom fields of the subscription.
   */
  custom_fields: Record<string, unknown> | null;
}

export const subscriptionSchema = schema<Subscription>()(
  z.object({
    id: z.string(),
    customer: payeeSchema,
    amount: z.number(),
    currency: z.string(),
    status: subscriptionStatusSchema,
    current_period_start: z.date(),
    current_period_end: z.date(),
    item_id: z.string(),
    billing_interval: subscriptionBillingIntervalSchema,
    metadata: metadataSchema.nullable(),
    custom_fields: z.record(z.string(), z.unknown()).nullable(),
  }),
);

export interface UpdateSubscriptionSchema {
  /**
   * The metadata of the subscription.
   */
  metadata: PaykitMetadata;

  /**
   * The provider metadata of the subscription.
   */
  provider_metadata?: Record<string, unknown>;
}

export const updateSubscriptionSchema = schema<UpdateSubscriptionSchema>()(
  z.object({
    metadata: metadataSchema,
    provider_metadata: z.record(z.string(), z.unknown()).optional(),
  }),
);

export interface RetrieveSubscriptionSchema {
  /**
   * The unique identifier of the subscription.
   */
  id: string;
}

export const retrieveSubscriptionSchema = schema<RetrieveSubscriptionSchema>()(
  z.object({
    id: z.string(),
  }),
);

export interface DeleteSubscriptionSchema {
  /**
   * The unique identifier of the subscription.
   */
  id: string;
}

export const deleteSubscriptionSchema = schema<DeleteSubscriptionSchema>()(
  z.object({
    id: z.string(),
  }),
);

export interface CreateSubscriptionSchema
  extends Omit<
    Subscription,
    'id' | 'status' | 'custom_fields' | 'current_period_start' | 'current_period_end'
  > {
  /**
   * The provider metadata of the subscription.
   */
  provider_metadata?: Record<string, unknown>;
}

export const createSubscriptionSchema = schema<CreateSubscriptionSchema>()(
  subscriptionSchema
    .omit({
      id: true,
      status: true,
      custom_fields: true,
      current_period_start: true,
      current_period_end: true,
    })
    .extend({ provider_metadata: z.record(z.string(), z.unknown()).optional() }),
);
