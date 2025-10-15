import {
  PayKitProvider,
  Checkout,
  CreateCheckoutSchema,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionSchema,
  paykitEvent$InboundSchema,
  WebhookEventPayload,
  PaykitProviderOptions,
  HandleWebhookParams,
  UpdateCheckoutSchema,
  CreateSubscriptionSchema,
  CreatePaymentSchema,
  Payment,
  UpdatePaymentSchema,
  CreateRefundSchema,
  Refund,
  validateRequiredKeys,
  ProviderNotSupportedError,
  ConstraintViolationError,
  ResourceNotFoundError,
  WebhookError,
  NotImplementedError,
  schema,
  AbstractPayKitProvider,
} from '@paykit-sdk/core';
import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  Order,
  OrdersController,
  PaymentsController,
  Refund as PayPalRefund,
  OrderApplicationContextUserAction,
} from '@paypal/paypal-server-sdk';
import { z } from 'zod';
import { SubscriptionsController } from './controllers/subscription';
import { WebhookController } from './controllers/webhook';
import { VerifyWebhookStatus } from './schema';
import { paykitCheckout$InboundSchema, paykitPayment$InboundSchema, paykitRefund$InboundSchema } from './utils/mapper';

const PAYPAL_METADATA_MAX_LENGTH = 127;

export interface PayPalOptions extends PaykitProviderOptions {
  /**
   * The client ID for the PayPal API
   */
  clientId: string;

  /**
   * The client secret for the PayPal API
   */
  clientSecret: string;

  /**
   * Whether to use the sandbox environment
   */
  isSandbox: boolean;
}

const paypalOptionsSchema = schema<PayPalOptions>()(
  z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    isSandbox: z.boolean(),
    debug: z.boolean().optional(),
  }),
);

const providerName = 'paypal';
export class PayPalProvider extends AbstractPayKitProvider implements PayKitProvider {
  readonly providerName = providerName;

  private client: Client;
  private ordersController: OrdersController;
  private paymentsController: PaymentsController;
  private subscriptionsController: SubscriptionsController;
  private webhookController: WebhookController;

  constructor(config: PayPalOptions) {
    super(paypalOptionsSchema, config, providerName);

    const { clientId, clientSecret, isSandbox = true, debug } = config;

    const environment = isSandbox ? Environment.Sandbox : Environment.Production;

    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      timeout: 0,
      environment,
      logging: {
        logLevel: debug ? LogLevel.Info : LogLevel.Error,
        logRequest: { logBody: debug },
        logResponse: { logHeaders: debug },
      },
    });

    this.ordersController = new OrdersController(this.client);
    this.paymentsController = new PaymentsController(this.client);
    this.subscriptionsController = new SubscriptionsController(this.client);
    this.webhookController = new WebhookController(this.client);
  }

  /**
   * Checkout management
   * In PayPal, Order IS the checkout
   */
  createCheckout = async (params: CreateCheckoutSchema): Promise<Checkout> => {
    const stringifiedMetadata = JSON.stringify(params.metadata);

    if (stringifiedMetadata.length > PAYPAL_METADATA_MAX_LENGTH) {
      throw new ConstraintViolationError('Metadata exceeds maximum length', {
        value: stringifiedMetadata.length,
        limit: PAYPAL_METADATA_MAX_LENGTH,
        provider: this.providerName,
      });
    }
    const {
      currency = 'USD',
      amount = '0',
      itemName = 'Untitled Item',
    } = validateRequiredKeys(
      ['currency', 'amount', 'itemName'],
      params.provider_metadata as Record<string, string>,
      'Missing required parameters: {keys}',
    );

    const orderOptionsBody: Parameters<OrdersController['createOrder']>[0]['body'] = {
      intent: CheckoutPaymentIntent.Capture,
      payer: {
        ...(typeof params.customer === 'string' && { payerId: params.customer }),
        ...(typeof params.customer === 'object' &&
          'email' in params.customer && { emailAddress: params.customer.email }),
      },
      purchaseUnits: [
        {
          amount: { currencyCode: currency, value: amount },
          customId: stringifiedMetadata,
          items: [
            {
              sku: params.item_id,
              quantity: params.quantity.toString(),
              name: itemName,
              unitAmount: { currencyCode: currency, value: amount },
            },
          ],
        },
      ],
      applicationContext: { userAction: OrderApplicationContextUserAction.PayNow },
      ...(params.provider_metadata && { ...params.provider_metadata }),
    };

    if (params.billing) {
      orderOptionsBody.purchaseUnits[0].shipping = {
        name: { fullName: params.billing.address.name },
        address: {
          addressLine1: params.billing.address.line1,
          addressLine2: params.billing.address.line2,
          adminArea1: params.billing.address.city,
          adminArea2: params.billing.address.state,
          postalCode: params.billing.address.postal_code,
          countryCode: params.billing.address.country,
        },
        ...(params.billing.address.phone && {
          phoneNumber: {
            nationalNumber: params.billing.address.phone,
            countryCode: params.billing.address.country,
          },
        }),
      };
    }

    const order = await this.ordersController.createOrder({ body: orderOptionsBody });

    return paykitCheckout$InboundSchema(order.result);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const order = await this.ordersController.getOrder({ id });

    return paykitCheckout$InboundSchema(order.result);
  };

  updateCheckout = async (id: string, params: UpdateCheckoutSchema): Promise<Checkout> => {
    throw new ProviderNotSupportedError('updateCheckout', this.providerName, {
      reason: 'PayPal does not support updating orders. Cancel and create a new order instead.',
    });
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteCheckout', this.providerName, {
      reason: 'PayPal orders cannot be deleted. They expire automatically.',
    });
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new ProviderNotSupportedError('customer management', this.providerName, {
      reason: 'PayPal does not have standalone customer entities.',
      alternative: 'Use Payer information within orders or implement PayPal Vault API',
    });
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new ProviderNotSupportedError('updateCustomer', this.providerName, {
      reason: 'PayPal does not support standalone customer management.',
    });
  };

  deleteCustomer = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteCustomer', this.providerName, {
      reason: 'PayPal does not support standalone customer management.',
    });
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    throw new ProviderNotSupportedError('retrieveCustomer', this.providerName, {
      reason: 'PayPal does not support standalone customer management.',
    });
  };

  /**
   * Subscription management
   * Would need PayPal Subscriptions API - different from Orders
   */
  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    const subscription = await this.subscriptionsController.createSubscription({ body: params });
    return subscription as unknown as Subscription;
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.subscriptionsController.cancelSubscription({
      subscriptionId: id,
      reason: 'Customer requested cancellation',
    });

    return subscription as unknown as Subscription;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    const stringifiedMetadata = JSON.stringify(params.metadata);

    if (stringifiedMetadata.length > PAYPAL_METADATA_MAX_LENGTH) {
      throw new ConstraintViolationError('Metadata exceeds maximum length', {
        value: stringifiedMetadata.length,
        limit: PAYPAL_METADATA_MAX_LENGTH,
        provider: this.providerName,
      });
    }
    const subscription = await this.subscriptionsController.updateSubscription({
      subscriptionId: id,
      metadata: params.metadata ?? {},
    });

    return subscription as unknown as Subscription;
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.subscriptionsController.retrieveSubscription({
      subscriptionId: id,
    });

    return subscription as unknown as Subscription;
  };

  deleteSubscription = async (id: string): Promise<null> => {
    throw new NotImplementedError('deleteSubscription', 'PayPal', { futureSupport: false });
  };

  /**
   * Payment management
   * In PayPal, Order IS the payment
   */
  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const stringifiedMetadata = JSON.stringify(params.metadata);

    if (stringifiedMetadata.length > PAYPAL_METADATA_MAX_LENGTH) {
      throw new ConstraintViolationError('Metadata exceeds maximum length', {
        value: stringifiedMetadata.length,
        limit: PAYPAL_METADATA_MAX_LENGTH,
        provider: this.providerName,
      });
    }

    const orderOptionsBody: Parameters<OrdersController['createOrder']>[0]['body'] = {
      intent: CheckoutPaymentIntent.Capture,
      payer: {
        ...(typeof params.customer === 'string' && { payerId: params.customer }),
        ...(typeof params.customer === 'object' &&
          'email' in params.customer && { emailAddress: params.customer.email }),
      },
      purchaseUnits: [
        {
          amount: { currencyCode: params.currency, value: params.amount.toString() },
          customId: stringifiedMetadata,
        },
      ],
    };

    if (params.billing) {
      orderOptionsBody.purchaseUnits[0].shipping = {
        name: { fullName: params.billing.address.name },
        address: {
          addressLine1: params.billing.address.line1,
          addressLine2: params.billing.address.line2,
          adminArea1: params.billing.address.city,
          adminArea2: params.billing.address.state,
          postalCode: params.billing.address.postal_code,
          countryCode: params.billing.address.country,
        },
        ...(params.billing.address.phone && {
          phoneNumber: {
            nationalNumber: params.billing.address.phone,
            countryCode: params.billing.address.country,
          },
        }),
      };
    }

    const order = await this.ordersController.createOrder({ body: orderOptionsBody });

    return paykitPayment$InboundSchema(order.result);
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    throw new ProviderNotSupportedError('updatePayment', this.providerName, {
      reason: 'PayPal does not support updating orders.',
    });
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    const order = await this.ordersController.getOrder({ id });

    return paykitPayment$InboundSchema(order.result);
  };

  deletePayment = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deletePayment', this.providerName, {
      reason: 'PayPal orders cannot be deleted. They expire automatically.',
    });
  };

  capturePayment = async (id: string): Promise<Payment> => {
    const captured = await this.ordersController.captureOrder({ id });
    return paykitPayment$InboundSchema(captured.result);
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    // PayPal doesn't have explicit cancel, but you can void authorizations
    throw new ProviderNotSupportedError('cancelPayment', this.providerName, {
      reason: 'PayPal order cancellation not directly supported. Orders expire automatically.',
    });
  };

  /**
   * Refund management
   */
  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    const order = await this.ordersController.getOrder({ id: params.payment_id });

    const captureIds = order.result.purchaseUnits?.[0]?.payments?.captures?.map(c => c.id!) || [];

    if (captureIds.length === 0) {
      throw new ResourceNotFoundError('Capture', params.payment_id, this.providerName);
    }

    const currencyCode = order.result.purchaseUnits?.[0]?.amount?.currencyCode || 'USD';
    const amount = params.amount ? params.amount.toString() : order.result.purchaseUnits?.[0]?.amount?.value || '0';

    const refund = await this.paymentsController.refundCapturedPayment({
      captureId: captureIds[0],
      body: { amount: { currencyCode, value: amount } },
    });

    return paykitRefund$InboundSchema(refund.result);
  };

  /**
   * Webhook management
   */
  handleWebhook = async (params: HandleWebhookParams): Promise<Array<WebhookEventPayload>> => {
    const { body, headers, webhookSecret: webhookId } = params;

    const { result } = await this.webhookController.verifyWebhook({
      authAlgo: headers['paypal-auth-algo'] as string,
      certUrl: headers['paypal-cert-url'] as string,
      transmissionId: headers['paypal-transmission-id'] as string,
      transmissionSig: headers['paypal-transmission-sig'] as string,
      transmissionTime: headers['paypal-transmission-time'] as string,
      webhookId,
      webhookEvent: JSON.parse(body),
    });

    if (result.verification_status !== VerifyWebhookStatus.SUCCESS) {
      throw new WebhookError('Webhook verification failed', { provider: this.providerName });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    const webhookHandlers: Record<string, () => Promise<Array<WebhookEventPayload>>> = {
      'CHECKOUT.ORDER.APPROVED': async () => {
        const orderData = event.resource as Order;
        const payment = paykitPayment$InboundSchema(orderData);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.created',
            created: Date.now() / 1000,
            id: event.id,
            data: payment,
          }),
        ];
      },

      'CHECKOUT.ORDER.COMPLETED': async () => {
        const orderData = event.resource as Order;
        const payment = paykitPayment$InboundSchema(orderData);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.updated',
            created: Date.now() / 1000,
            id: event.id,
            data: payment,
          }),
        ];
      },

      'PAYMENT.CAPTURE.COMPLETED': async () => {
        const orderData = event.resource as Order;
        const payment = paykitPayment$InboundSchema(orderData);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.updated',
            created: Date.now() / 1000,
            id: event.id,
            data: payment,
          }),
        ];
      },

      'PAYMENT.CAPTURE.REFUNDED': async () => {
        const refundData = event.resource as PayPalRefund;
        const refund = paykitRefund$InboundSchema(refundData);

        return [
          paykitEvent$InboundSchema<Refund>({
            type: 'refund.created',
            created: Date.now() / 1000,
            id: event.id,
            data: refund,
          }),
        ];
      },
    };

    const handler = webhookHandlers[eventType];

    if (!handler) {
      throw new WebhookError(`Unhandled event type: ${eventType}`, { provider: this.providerName });
    }

    return await handler();
  };
}
