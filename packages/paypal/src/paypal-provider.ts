import {
  PayKitProvider,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionSchema,
  paykitEvent$InboundSchema,
  WebhookEventPayload,
  PaykitProviderOptions,
  HandleWebhookParams,
  UpdateCheckoutParams,
  CreateSubscriptionSchema,
  CreatePaymentSchema,
  Payment,
  UpdatePaymentSchema,
  CreateRefundSchema,
  Refund,
  validateRequiredKeys,
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
import { PayPalCoreApi } from './api/core-api';
import { paykitCheckout$InboundSchema, paykitPayment$InboundSchema, paykitRefund$InboundSchema } from './utils/mapper';

const PAYPAL_METADATA_MAX_LENGTH = 127;

export interface PayPalConfig extends PaykitProviderOptions {
  clientId: string;
  clientSecret: string;
  isSandbox?: boolean;
}

export class PayPalProvider implements PayKitProvider {
  private client: Client;
  private core: PayPalCoreApi;
  private ordersController: OrdersController;
  private paymentsController: PaymentsController;

  constructor(config: PayPalConfig) {
    const { clientId, clientSecret, isSandbox = true, debug } = config;

    const environment = isSandbox ? Environment.Sandbox : Environment.Production;

    this.client = new Client({
      clientCredentialsAuthCredentials: { oAuthClientId: clientId, oAuthClientSecret: clientSecret },
      timeout: 0,
      environment,
      logging: {
        logLevel: debug ? LogLevel.Info : LogLevel.Error,
        logRequest: { logBody: debug },
        logResponse: { logHeaders: debug },
      },
    });

    this.core = new PayPalCoreApi(this.client, config);
    this.ordersController = new OrdersController(this.client);
    this.paymentsController = new PaymentsController(this.client);
  }

  readonly providerName = 'paypal';

  /**
   * Checkout management
   * In PayPal, Order IS the checkout
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const stringifiedMetadata = JSON.stringify(params.metadata);

    if (stringifiedMetadata.length > PAYPAL_METADATA_MAX_LENGTH) {
      throw new Error(`Metadata is too long, max ${PAYPAL_METADATA_MAX_LENGTH} characters when stringified`);
    }

    const { currency = 'USD', amount = '0' } = validateRequiredKeys(
      ['currency', 'amount'],
      params.provider_metadata as Record<string, string>,
      'Missing required parameters: {keys}',
    );

    const order = await this.ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: { currencyCode: currency, value: amount },
            customId: stringifiedMetadata,
            items: [
              {
                sku: params.item_id,
                quantity: params.quantity.toString(),
                name: params.item_id, // todo: fix
                unitAmount: { currencyCode: currency, value: amount },
              },
            ],
          },
        ],
        applicationContext: { userAction: OrderApplicationContextUserAction.PayNow },
      },
    });

    return paykitCheckout$InboundSchema(order.result);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const order = await this.ordersController.getOrder({ id });

    return paykitCheckout$InboundSchema(order.result);
  };

  updateCheckout = async (id: string, params: UpdateCheckoutParams): Promise<Checkout> => {
    throw new Error('PayPal does not support updating orders. Cancel and create a new order instead.');
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new Error('PayPal orders cannot be deleted. They expire automatically.');
  };

  /**
   * Customer management
   * PayPal doesn't have standalone customer entities
   * Customer data is embedded in orders via Payer info
   */
  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    // Store customer email/info in your own database
    // PayPal Vault API could be used but requires separate implementation
    throw new Error('PayPal does not support standalone customer management. Use Payer info within orders.');
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new Error('PayPal does not support standalone customer management.');
  };

  deleteCustomer = async (id: string): Promise<null> => {
    throw new Error('PayPal does not support standalone customer management.');
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    throw new Error('PayPal does not support standalone customer management.');
  };

  /**
   * Subscription management
   * Would need PayPal Subscriptions API - different from Orders
   */
  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    throw new Error('PayPal subscriptions not implemented. Use PayPal Billing Plans API.');
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    throw new Error('PayPal subscriptions not implemented.');
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    throw new Error('PayPal subscriptions not implemented.');
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    throw new Error('PayPal subscriptions not implemented.');
  };

  deleteSubscription = async (id: string): Promise<null> => {
    throw new Error('PayPal subscriptions not implemented.');
  };

  /**
   * Payment management
   * In PayPal, Order IS the payment
   */
  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const order = await this.ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: params.currency,
              value: params.amount.toString(),
            },
            customId: params.metadata?.session_id as string,
          },
        ],
      },
    });

    return paykitPayment$InboundSchema(order.result);
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    // PayPal doesn't allow updating orders after creation
    throw new Error('PayPal does not support updating orders.');
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    const order = await this.ordersController.getOrder({ id });

    return paykitPayment$InboundSchema(order.result);
  };

  deletePayment = async (id: string): Promise<null> => {
    // PayPal orders expire automatically
    return null;
  };

  capturePayment = async (id: string): Promise<Payment> => {
    const captured = await this.ordersController.captureOrder({ id });
    return paykitPayment$InboundSchema(captured.result);
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    // PayPal doesn't have explicit cancel, but you can void authorizations
    throw new Error('PayPal order cancellation not directly supported. Orders expire automatically.');
  };

  /**
   * Refund management
   */
  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    // Need to get capture IDs from the order first
    const order = await this.ordersController.getOrder({ id: params.payment_id });

    const captureIds = order.result.purchaseUnits?.[0]?.payments?.captures?.map(c => c.id!) || [];

    if (captureIds.length === 0) {
      throw new Error('No captures found for this order');
    }

    // Refund the first capture (or all if needed)
    const refund = await this.paymentsController.refundCapturedPayment({
      captureId: captureIds[0],
      body: {
        amount: params.amount
          ? {
              currencyCode: order.result.purchaseUnits?.[0]?.amount?.currencyCode || 'USD',
              value: params.amount.toString(),
            }
          : undefined,
      },
    });

    return paykitRefund$InboundSchema(refund.result);
  };

  /**
   * Webhook management
   */
  handleWebhook = async (params: HandleWebhookParams): Promise<Array<WebhookEventPayload>> => {
    const { body, headers, webhookSecret } = params;

    const verified = await this.core.verifyWebhook({ headers, body });

    if (!verified.success) {
      throw new Error('Webhook verification failed');
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    const webhookHandlers: Record<string, () => Promise<Array<WebhookEventPayload>>> = {
      'CHECKOUT.ORDER.APPROVED': async () => {
        const orderData = event.resource as Order;
        const payment = paykitPayment$InboundSchema(orderData);

        return [paykitEvent$InboundSchema<Payment>({ type: 'payment.created', created: Date.now() / 1000, id: event.id, data: payment })];
      },

      'CHECKOUT.ORDER.COMPLETED': async () => {
        const orderData = event.resource as Order;
        const payment = paykitPayment$InboundSchema(orderData);

        return [paykitEvent$InboundSchema<Payment>({ type: 'payment.updated', created: Date.now() / 1000, id: event.id, data: payment })];
      },

      'PAYMENT.CAPTURE.COMPLETED': async () => {
        const orderData = event.resource as Order;
        const payment = paykitPayment$InboundSchema(orderData);

        return [paykitEvent$InboundSchema<Payment>({ type: 'payment.updated', created: Date.now() / 1000, id: event.id, data: payment })];
      },

      'PAYMENT.CAPTURE.REFUNDED': async () => {
        const refundData = event.resource as PayPalRefund;
        const refund = paykitRefund$InboundSchema(refundData);

        return [paykitEvent$InboundSchema<Refund>({ type: 'refund.created', created: Date.now() / 1000, id: event.id, data: refund })];
      },
    };

    const handler = webhookHandlers[eventType];

    if (!handler) {
      throw new Error(`Unhandled event type: ${eventType}`);
    }

    return await handler();
  };
}
