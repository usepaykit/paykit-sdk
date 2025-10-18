import {
  paykitEvent$InboundSchema,
  WebhookEventPayload,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Checkout,
  CreateCheckoutSchema,
  Subscription,
  UpdateSubscriptionSchema,
  HandleWebhookParams,
  PayKitProvider,
  PaykitProviderOptions,
  Invoice,
  billingModeSchema,
  CreatePaymentSchema,
  Payment,
  UpdatePaymentSchema,
  createPaymentSchema,
  updatePaymentSchema,
  CreateRefundSchema,
  CreateSubscriptionSchema,
  Refund,
  UpdateCheckoutSchema,
  updateCheckoutSchema,
  createRefundSchema,
  createCheckoutSchema,
  retrieveCheckoutSchema,
  createCustomerSchema,
  updateCustomerSchema,
  retrieveCustomerSchema,
  retrieveSubscriptionSchema,
  updateSubscriptionSchema,
  ProviderNotSupportedError,
  OperationFailedError,
  ValidationError,
  ResourceNotFoundError,
  CapturePaymentSchema,
  capturePaymentSchema,
  schema,
  OverrideProps,
  AbstractPayKitProvider,
  PAYKIT_METADATA_KEY,
  stringifyMetadataValues,
} from '@paykit-sdk/core';
import { Polar, SDKOptions, ServerList } from '@polar-sh/sdk';
import { CheckoutCreate } from '@polar-sh/sdk/models/components/checkoutcreate.js';
import { Customer as PolarCustomer } from '@polar-sh/sdk/models/components/customer.js';
import { Order as PolarOrder } from '@polar-sh/sdk/models/components/order.js';
import { Refund as PolarRefund } from '@polar-sh/sdk/models/components/refund.js';
import { Subscription as PolarSubscription } from '@polar-sh/sdk/models/components/subscription.js';
import { Refunds } from '@polar-sh/sdk/sdk/refunds.js';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { z } from 'zod';
import {
  mapRefundReason,
  paykitCheckout$InboundSchema,
  paykitCustomer$InboundSchema,
  paykitInvoice$InboundSchema,
  paykitPayment$InboundSchema,
  paykitRefund$InboundSchema,
  paykitSubscription$InboundSchema,
} from '../lib/mapper';

export interface PolarOptions
  extends PaykitProviderOptions<
    OverrideProps<
      Pick<SDKOptions, 'accessToken' | 'userAgent' | 'retryConfig' | 'timeoutMs'>,
      {
        accessToken: string;
      }
    >
  > {
  isSandbox: boolean;
}

const polarOptionsSchema = schema<PolarOptions>()(
  z.object({
    accessToken: z.string(),
    isSandbox: z.boolean(),
    debug: z.boolean().optional(),
    userAgent: z.string().optional(),
    retryConfig: z.any().optional(),
    timeoutMs: z.number().optional(),
  }),
);

const providerName = 'polar';

export class PolarProvider extends AbstractPayKitProvider implements PayKitProvider {
  readonly providerName = providerName;

  private polar: Polar;
  private refunds: Refunds;

  private readonly productionURL = ServerList['production'];
  private readonly sandboxURL = ServerList['sandbox'];

  constructor(private config: PolarOptions) {
    super(polarOptionsSchema, config, providerName);

    const { accessToken, isSandbox, debug = true, ...rest } = config;

    const serverURL = isSandbox ? this.sandboxURL : this.productionURL;

    this.polar = new Polar({ accessToken, serverURL, ...rest });
    this.refunds = new Refunds({ accessToken, serverURL, ...rest });
  }

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutSchema): Promise<Checkout> => {
    const { error, data } = createCheckoutSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'createCheckout');
    }

    const { metadata, item_id, provider_metadata } = data;

    const checkoutMetadata = stringifyMetadataValues(metadata ?? {});

    const checkoutCreateOptions: CheckoutCreate = {
      metadata: checkoutMetadata,
      products: [item_id],
      ...provider_metadata,
    };

    if (data.billing) {
      checkoutCreateOptions.customerBillingAddress = {
        line1: data.billing.address.line1,
        line2: data.billing.address.line2,
        postalCode: data.billing.address.postal_code,
        city: data.billing.address.city,
        country: data.billing.address.country,
        state: data.billing.address.state,
      };

      checkoutCreateOptions.metadata = {
        ...checkoutMetadata,
        _shipping_phone: data.billing.address.phone ?? '',
        _shipping_carrier: data.billing.carrier ?? '',
      };
    }

    const response = await this.polar.checkouts.create(checkoutCreateOptions);

    return paykitCheckout$InboundSchema(response);
  };

  updateCheckout = async (
    id: string,
    params: UpdateCheckoutSchema,
  ): Promise<Checkout> => {
    const { error, data } = updateCheckoutSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'updateCheckout');
    }

    const { metadata, item_id, provider_metadata, ...restData } = data;

    const response = await this.polar.checkouts.update({
      id,
      checkoutUpdate: {
        ...restData,
        ...(metadata && { metadata: stringifyMetadataValues(metadata ?? {}) }),
        ...(item_id && { products: [item_id] }),
        ...provider_metadata,
      },
    });

    return paykitCheckout$InboundSchema(response);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const { error } = retrieveCheckoutSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'retrieveCheckout');
    }

    const response = await this.polar.checkouts.get({ id });

    return paykitCheckout$InboundSchema(response);
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteCheckout', 'Polar', {
      reason: 'Polar does not support deleting checkouts',
    });
  };

  /**
   * Customer management
   */
  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const { error, data } = createCustomerSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'createCustomer');
    }

    const { email, metadata } = data;

    const name = data?.name ?? email.split('@')[0];

    const response = await this.polar.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        [PAYKIT_METADATA_KEY]: JSON.stringify({ phone: data?.phone ?? '' }),
      },
    });

    return paykitCustomer$InboundSchema(response);
  };

  updateCustomer = async (
    id: string,
    params: UpdateCustomerParams,
  ): Promise<Customer> => {
    const { error, data } = updateCustomerSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'retrieveCustomer');
    }

    const { email, name, metadata, provider_metadata } = data;

    const response = await this.polar.customers.update({
      id,
      customerUpdate: {
        ...(email && { email }),
        ...(name && { name }),
        ...(metadata && { metadata }),
        ...provider_metadata,
      },
    });

    return paykitCustomer$InboundSchema(response);
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    const { error } = retrieveCustomerSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'retrieveCustomer');
    }

    const response = await this.polar.customers.get({ id });

    return paykitCustomer$InboundSchema(response);
  };

  deleteCustomer = async (id: string): Promise<null> => {
    await this.polar.customers.delete({ id });

    return null;
  };

  /**
   * Subscription management
   */
  createSubscription = async (
    params: CreateSubscriptionSchema,
  ): Promise<Subscription> => {
    throw new ProviderNotSupportedError('createSubscription', 'Polar', {
      reason: 'Subscriptions can only be created through checkouts',
    });
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(
        error,
        this.providerName,
        'retrieveSubscription',
      );
    }

    const subscription = await this.polar.subscriptions.revoke({ id });

    return paykitSubscription$InboundSchema(subscription);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(
        error,
        this.providerName,
        'retrieveSubscription',
      );
    }

    const response = await this.polar.subscriptions.get({ id });

    return paykitSubscription$InboundSchema(response);
  };

  updateSubscription = async (
    id: string,
    params: UpdateSubscriptionSchema,
  ): Promise<Subscription> => {
    const { error, data } = updateSubscriptionSchema.safeParse({ id, ...params });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'updateSubscription');
    }

    const response = await this.polar.subscriptions.update({
      id,
      subscriptionUpdate: { ...(data.metadata ?? {}) },
    });

    return paykitSubscription$InboundSchema(response);
  };

  deleteSubscription = async (id: string): Promise<null> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'deleteSubscription');
    }

    return (await this.cancelSubscription(id)) === null ? null : null;
  };

  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const { error, data } = createPaymentSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'createPayment');
    }

    const paymentMetadata = stringifyMetadataValues(data.metadata ?? {});

    const checkoutCreateOptions: CheckoutCreate = {
      ...(data.provider_metadata && { ...data.provider_metadata }),
      amount: data.amount,
      metadata: paymentMetadata,
      products: data.item_id ? [data.item_id] : [],
    };

    if (typeof data.customer === 'string') {
      checkoutCreateOptions.customerId = data.customer;
    } else if (typeof data.customer === 'object') {
      checkoutCreateOptions.customerEmail = data.customer.email;
    }

    if (data.billing) {
      checkoutCreateOptions.customerBillingAddress = {
        line1: data.billing.address.line1,
        line2: data.billing.address.line2,
        postalCode: data.billing.address.postal_code,
        city: data.billing.address.city,
        country: data.billing.address.country,
        state: data.billing.address.state,
      };

      checkoutCreateOptions.metadata = {
        ...paymentMetadata,
        [PAYKIT_METADATA_KEY]: JSON.stringify({
          _shipping_phone: data.billing.address.phone ?? '',
          _shipping_carrier: data.billing.carrier ?? '',
        }),
      };
    }

    const checkoutResponse = await this.polar.checkouts.create(checkoutCreateOptions);

    return paykitPayment$InboundSchema(checkoutResponse);
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    const { error, data } = updatePaymentSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'updatePayment');
    }

    const { provider_metadata, ...rest } = data;

    const paymentMetadata = stringifyMetadataValues(rest.metadata ?? {});

    const checkoutResponse = await this.polar.checkouts.update({
      id,
      checkoutUpdate: {
        ...rest,
        ...(rest.metadata && { metadata: paymentMetadata }),
        ...(rest.item_id && { products: [rest.item_id] }),
        ...provider_metadata,
      },
    });

    return paykitPayment$InboundSchema(checkoutResponse);
  };

  capturePayment = async (id: string, params: CapturePaymentSchema): Promise<Payment> => {
    const { data: _, error } = capturePaymentSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'capturePayment');
    }

    return this.retrievePayment(id); // payments are auto-captured by polar, just return the current state
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    throw new ProviderNotSupportedError('cancelPayment', this.providerName, {
      reason: 'Polar does not support canceling payments',
    });
  };

  deletePayment = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deletePayment', this.providerName, {
      reason: 'Polar does not support deleting payments',
    });
  };

  retrievePayment = async (id: string): Promise<Payment> => {
    const response = await this.polar.checkouts.get({ id });

    return paykitPayment$InboundSchema(response);
  };

  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    const { error, data } = createRefundSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'createRefund');
    }

    const order = await this.polar.orders.get({ id: data.payment_id });

    if (!order) {
      throw new ResourceNotFoundError('Order', data.payment_id, this.providerName);
    }

    const refund = await this.refunds.create({
      orderId: order.id,
      reason: data.reason
        ? mapRefundReason(this.config.debug ?? true, data.reason)
        : 'other',
      amount: data.amount,
      ...(data.provider_metadata && { ...data.provider_metadata }),
    });

    if (!refund) {
      throw new OperationFailedError('Failed to create refund', this.providerName);
    }

    return paykitRefund$InboundSchema(refund);
  };

  /**
   * Webhook management
   */
  handleWebhook = async (
    params: HandleWebhookParams,
  ): Promise<Array<WebhookEventPayload>> => {
    const { body, headers, webhookSecret } = params;

    const webhookId = headers.get('webhook-id') as string;
    const webhookTimestamp = headers.get('webhook-timestamp') as string;

    const plainHeaders = Object.fromEntries(headers.entries());

    const { data, type } = validateEvent(body, plainHeaders, webhookSecret);

    type PolarEventLiteral = Exclude<typeof type, undefined>;

    const webhookHandlers: Partial<
      Record<PolarEventLiteral, (data: any) => Array<WebhookEventPayload> | null>
    > = {
      /**
       * Invoice
       */
      'order.paid': (data: PolarOrder) => {
        const { status, metadata } = data;

        if (status == 'paid') {
          const invoice = paykitInvoice$InboundSchema({
            ...data,
            billingMode: billingModeSchema.parse('one_time'),
            metadata: { ...(metadata ?? {}) },
          });

          const payment: Payment = {
            id: data.id,
            amount: data.totalAmount,
            currency: data.currency,
            customer: data.customerId
              ? data.customerId
              : { email: data.customer.email ?? '' },
            status: data.status === 'paid' ? 'succeeded' : 'pending',
            metadata: stringifyMetadataValues(metadata ?? {}),
            item_id: data.product.id,
          };

          // Consumable purchase
          return [
            paykitEvent$InboundSchema<Payment>({
              type: 'payment.updated',
              created: parseInt(webhookTimestamp),
              id: webhookId,
              data: payment,
            }),
            paykitEvent$InboundSchema<Invoice>({
              type: 'invoice.generated',
              created: parseInt(webhookTimestamp),
              id: webhookId,
              data: invoice,
            }),
          ];
        }

        return null;
      },

      'order.created': (data: PolarOrder) => {
        const { billingReason, metadata, status } = data;

        if (
          ['subscription_create', 'subscription_cycle'].includes(billingReason) &&
          status == 'paid'
        ) {
          const invoice = paykitInvoice$InboundSchema({
            ...data,
            billingMode: billingModeSchema.parse('recurring'),
            metadata: { ...(metadata ?? {}) },
          });

          const payment: Payment = {
            id: data.id,
            amount: data.totalAmount,
            currency: data.currency,
            customer: data.customerId
              ? data.customerId
              : { email: data.customer.email ?? '' },
            status: data.status === 'paid' ? 'succeeded' : 'pending',
            metadata: stringifyMetadataValues(metadata ?? {}),
            item_id: data.product.id,
          };

          return [
            paykitEvent$InboundSchema<Payment>({
              type: 'payment.created',
              created: parseInt(webhookTimestamp),
              id: webhookId,
              data: payment,
            }),
            paykitEvent$InboundSchema<Invoice>({
              type: 'invoice.generated',
              created: parseInt(webhookTimestamp),
              id: webhookId,
              data: invoice,
            }),
          ];
        }

        return null;
      },

      /**
       * Customer
       */
      'customer.created': (data: PolarCustomer) => {
        const customer = paykitCustomer$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Customer>({
            type: 'customer.created',
            created: parseInt(webhookTimestamp),
            id: webhookId,
            data: customer,
          }),
        ];
      },

      'customer.updated': (data: PolarCustomer) => {
        const customer = paykitCustomer$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Customer>({
            type: 'customer.updated',
            created: parseInt(webhookTimestamp),
            id: webhookId,
            data: customer,
          }),
        ];
      },

      'customer.deleted': (data: PolarCustomer) => {
        const customer = paykitCustomer$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Customer | null>({
            type: 'customer.deleted',
            created: parseInt(webhookTimestamp),
            id: webhookId,
            data: customer,
          }),
        ];
      },

      /**
       * Subscription
       */
      'subscription.updated': (data: PolarSubscription) => {
        const subscription = paykitSubscription$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Subscription>({
            type: 'subscription.updated',
            created: parseInt(webhookTimestamp),
            id: webhookId,
            data: subscription,
          }),
        ];
      },

      'subscription.created': (data: PolarSubscription) => {
        const subscription = paykitSubscription$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Subscription>({
            type: 'subscription.created',
            created: parseInt(webhookTimestamp),
            id: webhookId,
            data: subscription,
          }),
        ];
      },

      'subscription.revoked': (data: PolarSubscription) => {
        const subscription = paykitSubscription$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Subscription>({
            type: 'subscription.canceled',
            created: parseInt(webhookTimestamp),
            id: webhookId,
            data: subscription,
          }),
        ];
      },

      'refund.created': (data: PolarRefund) => {
        const refund = paykitRefund$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Refund>({
            type: 'refund.created',
            created: parseInt(webhookTimestamp),
            id: webhookId,
            data: refund,
          }),
        ];
      },
    };

    const handler = webhookHandlers[type as PolarEventLiteral];

    if (!handler)
      throw new Error(`Unhandled event type: ${type} for provider: ${this.providerName}`);

    const results = handler(data);

    if (!results)
      throw new Error(`Unhandled event type: ${type} for provider: ${this.providerName}`);

    return results;
  };
}
