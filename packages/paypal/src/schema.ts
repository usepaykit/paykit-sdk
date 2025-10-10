import { lazy, object, Schema, number, string, stringEnum, boolean } from '@paypal/paypal-server-sdk/dist/types/schema';

export interface ShippingAmount {
  /**
   * The currency code.
   */
  currency_code: string;

  /**
   * The value which might be an integer for currencies like JPY that are not typically fractional.
   */
  value: string;
}

export const shippingAmountSchema: Schema<ShippingAmount> = object({
  currency_code: ['currency_code', string()],
  value: ['value', string()],
});

export interface CreateSubscriptionSchema {
  /**
   * The ID of the plan, maps to `item_id` in the Paykit SDK.
   */
  plan_id: string;

  /**
   * The quantity of the plan.
   */
  quantity: number;

  /**
   * The custom ID of the subscription.
   */
  custom_id: string;

  /**
   * The start time of the subscription.
   */
  start_time: string;

  /**
   * The subscriber of the subscription.
   */
  subscriber: { email_address: string; name: { given_name: string; surname: string }; phone: { phone_number: string } };
}

export const createSubscriptionApticSchema: Schema<CreateSubscriptionSchema> = object({
  plan_id: ['plan_id', string()],
  quantity: ['quantity', number()],
  custom_id: ['custom_id', string()],
  start_time: ['start_time', string()],
  subscriber: [
    'subscriber',
    lazy(() =>
      object({
        email_address: ['email_address', string()],
        name: ['name', lazy(() => object({ given_name: ['given_name', string()], surname: ['surname', string()] }))],
        phone: ['phone', lazy(() => object({ phone_number: ['phone_number', string()] }))],
      }),
    ),
  ],
});

enum SubscriptionStatus {
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface Subscription {
  /**
   * The ID of the subscription.
   */
  id: string;

  /**
   * The ID of the plan.
   */
  plan_id: string;

  /**
   * The quantity of the subscription.
   */
  quantity: number;

  /**
   * The status of the subscription.
   */
  status: SubscriptionStatus;

  /**
   * The time the status was updated.
   */
  status_update_time: string;

  /**
   * The note for the status change.
   */
  status_change_note: string;

  /**
   * The time the subscription started.
   */
  start_time: string;

  /**
   * The subscriber of the subscription.
   */
  subscriber: {
    /**
     * The email address of the subscriber.
     */
    email_address: string;

    /**
     * The name of the subscriber.
     */
    name: {
      /**
       * The given name of the subscriber.
       */
      given_name: string;
      /**
       * The surname of the subscriber.
       */
      surname: string;
    };

    /**
     * The ID of the payer.
     */
    payer_id: string;
  };

  /**
   * Whether the plan was overridden.
   */
  plan_overridden: boolean;

  /**
   * The custom ID of the subscription.
   */
  custom_id: string;
}

export const subscriptionApticSchema: Schema<Subscription> = object({
  id: ['id', string()],
  plan_id: ['plan_id', string()],
  quantity: ['quantity', number()],
  custom_id: ['custom_id', string()],
  plan_overridden: ['plan_overridden', boolean()],
  start_time: ['start_time', string()],
  subscriber: [
    'subscriber',
    lazy(() =>
      object({
        email_address: ['email_address', string()],
        name: ['name', lazy(() => object({ given_name: ['given_name', string()], surname: ['surname', string()] }))],
        payer_id: ['payer_id', string()],
      }),
    ),
  ],
  status: ['status', stringEnum(SubscriptionStatus)],
  status_change_note: ['status_change_note', string()],
  status_update_time: ['status_update_time', string()],
});

interface ResumeSubscriptionSchema {
  /**
   * The reason for resuming the subscription.
   */
  reason: string;
}

export const resumeSubscriptionApticSchemaRequest: Schema<ResumeSubscriptionSchema> = object({
  reason: ['reason', string()],
});

// WEBHOOK

export enum VerifyWebhookStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface VerifyWebhookSchema {
  /**
   * The status of the verification.
   */
  verification_status: VerifyWebhookStatus;
}

export const verifyWebhookSchema: Schema<VerifyWebhookSchema> = object({
  verification_status: ['verification_status', stringEnum(VerifyWebhookStatus)],
});
