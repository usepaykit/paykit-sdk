import {
  paykitEvent$InboundSchema,
  WebhookEventPayload,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Checkout,
  CreateCheckoutParams,
  Subscription,
  UpdateSubscriptionSchema,
  HandleWebhookParams,
  headersExtractor,
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
  UpdateCheckoutParams,
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
} from '@paykit-sdk/core';
import { Polar, SDKOptions, ServerList } from '@polar-sh/sdk';
import { CheckoutCreate } from '@polar-sh/sdk/models/components/checkoutcreate.js';
import { Customer as PolarCustomer } from '@polar-sh/sdk/models/components/customer.js';
import { Order as PolarOrder } from '@polar-sh/sdk/models/components/order.js';
import { Refund as PolarRefund } from '@polar-sh/sdk/models/components/refund.js';
import { Subscription as PolarSubscription } from '@polar-sh/sdk/models/components/subscription.js';
import { Refunds } from '@polar-sh/sdk/sdk/refunds.js';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import _ from 'lodash';
import {
  mapRefundReason,
  paykitCheckout$InboundSchema,
  paykitCustomer$InboundSchema,
  paykitInvoice$InboundSchema,
  paykitPayment$InboundSchema,
  paykitRefund$InboundSchema,
  paykitSubscription$InboundSchema,
} from '../lib/mapper';

export interface PolarConfig extends PaykitProviderOptions<SDKOptions> {}

export class PolarProvider implements PayKitProvider {
  private polar: Polar;
  private refunds: Refunds;

  private readonly productionURL = ServerList['production'];
  private readonly sandboxURL = ServerList['sandbox'];

  constructor(private config: PolarConfig) {
    const { accessToken, server, ...rest } = config;

    this.polar = new Polar({ accessToken, serverURL: server === 'sandbox' ? this.sandboxURL : this.productionURL, ...rest });
    this.refunds = new Refunds({ accessToken, serverURL: server === 'sandbox' ? this.sandboxURL : this.productionURL, ...rest });
  }

  readonly providerName = 'polar';

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { error, data } = createCheckoutSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'createCheckout');
    }

    const { metadata, item_id, provider_metadata } = data;

    const checkoutCreateOptions: CheckoutCreate = {
      metadata,
      products: [item_id],
      ...provider_metadata,
    };

    if (data.shipping_info) {
      checkoutCreateOptions.customerBillingAddress = {
        line1: data.shipping_info.address.line1,
        line2: data.shipping_info.address.line2,
        postalCode: data.shipping_info.address.postal_code,
        city: data.shipping_info.address.city,
        country: data.shipping_info.address.country,
        state: data.shipping_info.address.state,
      };

      checkoutCreateOptions.metadata = {
        ...metadata,
        _shipping_phone: data.shipping_info.address.phone ?? '',
        _shipping_carrier: data.shipping_info.carrier ?? '',
      };
    }

    const response = await this.polar.checkouts.create(checkoutCreateOptions);

    return paykitCheckout$InboundSchema(response);
  };

  updateCheckout = async (id: string, params: UpdateCheckoutParams): Promise<Checkout> => {
    const { error, data } = updateCheckoutSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'updateCheckout');
    }

    const { provider_metadata } = params;

    const response = await this.polar.checkouts.update({
      id,
      checkoutUpdate: {
        ...data,
        ...(data.metadata && { metadata: _.mapValues(data.metadata ?? {}, value => JSON.stringify(value)) }),
        ...(data.item_id && { products: [data.item_id] }),
        ...provider_metadata,
      },
    });

    return paykitCheckout$InboundSchema(response);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const { error } = retrieveCheckoutSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'retrieveCheckout');
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

    if (error) throw new Error(error.message.split('\n').join(' '));

    const { email, name, metadata } = data;

    const response = await this.polar.customers.create({ email, name, ...(metadata && { metadata }) });

    return paykitCustomer$InboundSchema(response);
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const { error, data } = updateCustomerSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'retrieveCustomer');
    }

    const { email, name, metadata, provider_metadata } = data;

    const response = await this.polar.customers.update({
      id,
      customerUpdate: { ...(email && { email }), ...(name && { name }), ...(metadata && { metadata }), ...provider_metadata },
    });

    return paykitCustomer$InboundSchema(response);
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    const { error } = retrieveCustomerSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'retrieveCustomer');
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
  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    throw new ProviderNotSupportedError('createSubscription', 'Polar', {
      reason: 'Subscriptions can only be created through checkouts',
    });
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'retrieveSubscription');
    }

    const subscription = await this.polar.subscriptions.revoke({ id });

    return paykitSubscription$InboundSchema(subscription);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'retrieveSubscription');
    }

    const response = await this.polar.subscriptions.get({ id });

    return paykitSubscription$InboundSchema(response);
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    const { error, data } = updateSubscriptionSchema.safeParse({ id, ...params });

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'updateSubscription');
    }

    const response = await this.polar.subscriptions.update({ id, subscriptionUpdate: { ...(data.metadata ?? {}) } });

    return paykitSubscription$InboundSchema(response);
  };

  deleteSubscription = async (id: string): Promise<null> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) throw new Error(error.message.split('\n').join(' '));

    return (await this.cancelSubscription(id)) === null ? null : null;
  };

  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const { error, data } = createPaymentSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'createPayment');
    }

    const metadataCore = _.mapValues(data.metadata ?? {}, value => JSON.stringify(value));

    const checkoutCreateOptions: CheckoutCreate = {
      amount: data.amount,
      ...(typeof data.customer === 'string' && { customerId: data.customer }),
      ...(typeof data.customer === 'object' && { customerEmail: data.customer.email }),
      metadata: _.mapValues(metadataCore ?? {}, value => JSON.stringify(value)),
      products: data.product_id ? [data.product_id] : [],
      ...(data.provider_metadata && { ...data.provider_metadata }),
    };

    if (data.shipping_info) {
      checkoutCreateOptions.customerBillingAddress = {
        line1: data.shipping_info.address.line1,
        line2: data.shipping_info.address.line2,
        postalCode: data.shipping_info.address.postal_code,
        city: data.shipping_info.address.city,
        country: data.shipping_info.address.country,
        state: data.shipping_info.address.state,
      };

      checkoutCreateOptions.metadata = {
        ...metadataCore,
        _shipping_phone: data.shipping_info.address.phone ?? '',
        _shipping_carrier: data.shipping_info.carrier ?? '',
      };
    }

    const checkoutResponse = await this.polar.checkouts.create(checkoutCreateOptions);

    return paykitPayment$InboundSchema(checkoutResponse);
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    const { error, data } = updatePaymentSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, 'polar', 'updatePayment');
    }

    const { provider_metadata, ...rest } = data;

    const checkoutResponse = await this.polar.checkouts.update({
      id,
      checkoutUpdate: {
        ...rest,
        ...(rest.metadata && { metadata: _.mapValues(rest.metadata ?? {}, value => JSON.stringify(value)) }),
        ...(rest.product_id && { products: [rest.product_id] }),
        ...provider_metadata,
      },
    });

    return paykitPayment$InboundSchema(checkoutResponse);
  };

  capturePayment = async (id: string): Promise<Payment> => {
    return this.retrievePayment(id); // payments are auto-captured by polar, just return the current state
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    throw new ProviderNotSupportedError('cancelPayment', 'Polar', {
      reason: 'Polar does not support canceling payments',
    });
  };

  deletePayment = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deletePayment', 'Polar', {
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
      throw ValidationError.fromZodError(error, 'polar', 'createRefund');
    }

    const order = await this.polar.orders.get({ id: data.payment_id });

    if (!order) {
      throw new ResourceNotFoundError('Order', data.payment_id, 'Polar');
    }

    const refund = await this.refunds.create({
      orderId: order.id,
      reason: data.reason ? mapRefundReason(this.config.debug ?? false, data.reason) : 'other',
      amount: data.amount,
      ...(data.provider_metadata && { ...data.provider_metadata }),
    });

    if (!refund) {
      throw new OperationFailedError('Failed to create refund', 'Polar');
    }

    return paykitRefund$InboundSchema(refund);
  };

  /**
   * Webhook management
   */
  handleWebhook = async (params: HandleWebhookParams): Promise<Array<WebhookEventPayload>> => {
    const { body, headers, webhookSecret } = params;

    const requiredHeaders = ['webhook-id', 'webhook-timestamp', 'webhook-signature'] as const;

    const webhookHeaders = headersExtractor(headers, requiredHeaders).reduce(
      (acc, kv) => {
        (acc as any)[kv.key] = Array.isArray(kv.value) ? kv.value.join(',') : kv.value;
        return acc;
      },
      {} as Record<(typeof requiredHeaders)[number], string>,
    );

    const { data, type } = validateEvent(body, webhookHeaders, webhookSecret);

    const id = webhookHeaders['webhook-id'];
    const timestamp = webhookHeaders['webhook-timestamp'];

    type PolarEventLiteral = Exclude<typeof type, undefined>;

    const webhookHandlers: Partial<Record<PolarEventLiteral, (data: any) => Array<WebhookEventPayload> | null>> = {
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
            customer: data.customerId ? data.customerId : { email: data.customer.email ?? '' },
            status: data.status === 'paid' ? 'succeeded' : 'pending',
            metadata: _.mapValues(metadata ?? {}, value => JSON.stringify(value)),
            product_id: data.product.id,
          };

          // Consumable purchase
          return [
            paykitEvent$InboundSchema<Payment>({ type: 'payment.updated', created: parseInt(timestamp), id, data: payment }),
            paykitEvent$InboundSchema<Invoice>({ type: 'invoice.generated', created: parseInt(timestamp), id, data: invoice }),
          ];
        }

        return null;
      },

      'order.created': (data: PolarOrder) => {
        const { billingReason, metadata, status } = data;

        if (['subscription_create', 'subscription_cycle'].includes(billingReason) && status == 'paid') {
          const invoice = paykitInvoice$InboundSchema({
            ...data,
            billingMode: billingModeSchema.parse('recurring'),
            metadata: { ...(metadata ?? {}) },
          });

          const payment: Payment = {
            id: data.id,
            amount: data.totalAmount,
            currency: data.currency,
            customer: data.customerId ? data.customerId : { email: data.customer.email ?? '' },
            status: data.status === 'paid' ? 'succeeded' : 'pending',
            metadata: _.mapValues(metadata ?? {}, value => JSON.stringify(value)),
            product_id: data.product.id,
          };

          return [
            paykitEvent$InboundSchema<Payment>({ type: 'payment.created', created: parseInt(timestamp), id, data: payment }),
            paykitEvent$InboundSchema<Invoice>({ type: 'invoice.generated', created: parseInt(timestamp), id, data: invoice }),
          ];
        }

        return null;
      },

      /**
       * Customer
       */
      'customer.created': (data: PolarCustomer) => {
        const customer = paykitCustomer$InboundSchema(data);

        return [paykitEvent$InboundSchema<Customer>({ type: 'customer.created', created: parseInt(timestamp), id, data: customer })];
      },

      'customer.updated': (data: PolarCustomer) => {
        const customer = paykitCustomer$InboundSchema(data);

        return [paykitEvent$InboundSchema<Customer>({ type: 'customer.updated', created: parseInt(timestamp), id, data: customer })];
      },

      'customer.deleted': (data: PolarCustomer) => {
        const customer = paykitCustomer$InboundSchema(data);

        return [paykitEvent$InboundSchema<Customer | null>({ type: 'customer.deleted', created: parseInt(timestamp), id, data: customer })];
      },

      /**
       * Subscription
       */
      'subscription.updated': (data: PolarSubscription) => {
        const subscription = paykitSubscription$InboundSchema(data);

        return [paykitEvent$InboundSchema<Subscription>({ type: 'subscription.updated', created: parseInt(timestamp), id, data: subscription })];
      },

      'subscription.created': (data: PolarSubscription) => {
        const subscription = paykitSubscription$InboundSchema(data);

        return [paykitEvent$InboundSchema<Subscription>({ type: 'subscription.created', created: parseInt(timestamp), id, data: subscription })];
      },

      'subscription.revoked': (data: PolarSubscription) => {
        const subscription = paykitSubscription$InboundSchema(data);

        return [paykitEvent$InboundSchema<Subscription>({ type: 'subscription.canceled', created: parseInt(timestamp), id, data: subscription })];
      },

      'refund.created': (data: PolarRefund) => {
        const refund = paykitRefund$InboundSchema(data);

        return [paykitEvent$InboundSchema<Refund>({ type: 'refund.created', created: parseInt(timestamp), id, data: refund })];
      },
    };

    const handler = webhookHandlers[type as PolarEventLiteral];

    if (!handler) throw new Error(`Unhandled event type: ${type}`);

    const results = handler(data);

    if (!results) throw new Error(`Unhandled event type: ${type}`);

    return results;
  };
}
