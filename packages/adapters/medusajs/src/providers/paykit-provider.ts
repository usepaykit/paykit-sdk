import {
  CapturePaymentInput,
  CapturePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from '@medusajs/framework/types';
import { AbstractPaymentProvider, MedusaError, PaymentActions } from '@medusajs/framework/utils';
import {
  CreatePaymentSchema,
  PayKit,
  PaykitMetadata,
  PayKitProvider,
  PaymentStatus,
  tryCatchAsync,
  validateRequiredKeys,
  providerSchema,
  Payee,
} from '@paykit-sdk/core';
import { z } from 'zod';
import { medusaStatus$InboundSchema } from '../utils/mapper';

const optionsSchema = z.object({
  /**
   * The underlying PayKit provider instance (Stripe, PayPal, etc.)
   * This is required and must be a valid PayKit provider instance
   */
  provider: providerSchema,

  /**
   * The webhook secret for the provider
   * This is required and must be a valid webhook secret
   */
  webhookSecret: z.string(),

  /**
   * Whether to enable debug mode
   * If enabled, the adapter will log debug information to the console
   */
  debug: z.boolean().optional(),
});

export type PaykitMedusaJSAdapterOptions = z.infer<typeof optionsSchema>;

export class PaykitMedusaJSAdapter extends AbstractPaymentProvider<PaykitMedusaJSAdapterOptions> {
  /**
   * The unique identifier for this payment provider
   * Will be stored as `pp_paykit_{id}` in Medusa
   */
  static identifier = 'paykit';

  protected readonly paykit: PayKit;
  protected readonly provider: PayKitProvider;
  protected readonly options: PaykitMedusaJSAdapterOptions;

  static validateOptions(options: Record<string, any>): void | never {
    const { error } = optionsSchema.safeParse(options);

    if (error) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, error.message);
    }

    return;
  }

  /**
   * Constructor receives Medusa's container and provider options
   *
   * @param cradle - Medusa's dependency injection container
   * @param options - PayKit provider configuration
   */
  constructor(cradle: Record<string, unknown>, options: PaykitMedusaJSAdapterOptions) {
    super(cradle, options);

    this.options = options;
    this.provider = options.provider;
    this.paykit = new PayKit(this.provider);

    if (this.options.debug) {
      console.info(`[PayKit] Initialized with provider: ${this.provider.providerName}`);
    }
  }

  initiatePayment = async ({
    context,
    amount,
    currency_code,
    data,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> => {
    if (this.options.debug) {
      console.info('[PayKit] Initiating payment', { context, amount, currency_code, data });
    }

    const intent: Record<string, unknown> = {
      status: 'pending',
      amount: Number(amount),
      currency: currency_code,
      metadata: { ...(data?.metadata ?? {}), session_id: data?.session_id ?? '' },
      provider_metadata: data?.provider_metadata ?? undefined,
    };

    let customer: Payee | undefined;

    if (context?.account_holder?.data?.id) {
      customer = context.account_holder.data.id as Payee;
    } else if (data?.email) {
      customer = { email: data.email } as Payee;
    }

    if (!customer) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Required: customer ID (account_holder) or email (data)');
    }

    if (typeof customer === 'object' && 'email' in customer) {
      await tryCatchAsync(
        this.paykit.customers.create({
          email: customer.email,
          phone: (data?.phone as string) ?? '',
          name: data?.name ? (data.name as string) : (customer.email.split('@')[0] as string),
          metadata: { PAYKIT_METADATA_KEY: JSON.stringify({ source: 'medusa' }) },
        }),
      );
      // todo: update account_holder with the new customer ID
    } else {
      customer = customer as string;
    }

    intent.customer = customer;

    const [paymentIntentResult, paymentIntentError] = await tryCatchAsync(
      this.paykit.payments.create(intent as unknown as CreatePaymentSchema),
    );

    if (paymentIntentError)
      throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, paymentIntentError.message);

    return {
      id: paymentIntentResult.id,
      status: medusaStatus$InboundSchema(paymentIntentResult.status),
    };
  };

  capturePayment = async (input: CapturePaymentInput): Promise<CapturePaymentOutput> => {
    if (this.options.debug) {
      console.info('[PayKit] Capturing payment', input);
    }

    const { id, amount } = validateRequiredKeys(
      ['id', 'amount'],
      (input?.data ?? {}) as Record<string, string>,
      'Missing required payment ID',
    );

    if (!id) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required payment ID');

    if (!amount) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required payment amount');

    const [paymentIntentResult, paymentIntentError] = await tryCatchAsync(
      this.paykit.payments.capture(id, { amount: Number(amount) }),
    );

    if (paymentIntentError)
      throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, paymentIntentError.message);

    return { data: paymentIntentResult as unknown as Record<string, unknown> };
  };

  authorizePayment = async (input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> => {
    if (this.options.debug) {
      console.info('[PayKit] Authorizing payment', input);
    }

    return this.getPaymentStatus(input);
  };

  cancelPayment = async (input: CancelPaymentInput): Promise<CancelPaymentOutput> => {
    if (this.options.debug) {
      console.info('[PayKit] Canceling payment', input);
    }

    const { id } = validateRequiredKeys(
      ['id'],
      (input?.data ?? {}) as Record<string, string>,
      'Missing required payment ID',
    );

    if (!id) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required payment ID');

    const [paymentIntentResult, paymentIntentError] = await tryCatchAsync(this.paykit.payments.cancel(id));

    if (paymentIntentError)
      throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, paymentIntentError.message);

    return { data: paymentIntentResult as unknown as Record<string, unknown> };
  };

  deletePayment = async (input: DeletePaymentInput): Promise<DeletePaymentOutput> => {
    return this.cancelPayment(input);
  };

  getPaymentStatus = async (input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> => {
    const { id } = validateRequiredKeys(
      ['id'],
      (input?.data ?? {}) as Record<string, string>,
      'Missing required payment ID',
    );

    if (!id) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required payment ID');

    const [paymentIntentResult, paymentIntentError] = await tryCatchAsync(this.paykit.payments.retrieve(id));

    if (paymentIntentError)
      throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, paymentIntentError.message);

    if (!paymentIntentResult) throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, 'Payment not found');

    return {
      status: medusaStatus$InboundSchema(paymentIntentResult.status),
      data: paymentIntentResult as unknown as Record<string, unknown>,
    };
  };

  refundPayment = async (input: RefundPaymentInput): Promise<RefundPaymentOutput> => {
    if (this.options.debug) {
      console.info('[PayKit] Refunding payment', input);
    }

    const { id: paymentId } = validateRequiredKeys(
      ['id'],
      (input?.data ?? {}) as Record<string, string>,
      'Missing required payment ID',
    );

    if (!paymentId) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required payment ID');

    const [refundResult, refundError] = await tryCatchAsync(
      this.paykit.refunds.create({
        payment_id: paymentId,
        amount: Number(input.amount),
        reason: null,
        metadata: input.data?.metadata ? (input.data.metadata as unknown as PaykitMetadata) : null,
        provider_metadata: input.data?.provider_metadata
          ? (input.data.provider_metadata as unknown as Record<string, unknown>)
          : undefined,
      }),
    );

    if (refundError) throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, refundError.message);

    return { data: refundResult as unknown as Record<string, unknown> };
  };

  retrievePayment = async (input: RetrievePaymentInput): Promise<RetrievePaymentOutput> => {
    if (this.options.debug) {
      console.info('[PayKit] Retrieving payment', input);
    }

    const { id } = validateRequiredKeys(
      ['id'],
      (input?.data ?? {}) as Record<string, string>,
      'Missing required payment ID',
    );

    if (!id) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required payment ID');

    const [paymentIntentResult, paymentIntentError] = await tryCatchAsync(this.paykit.payments.retrieve(id));

    if (paymentIntentError)
      throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, paymentIntentError.message);

    return { data: paymentIntentResult as unknown as Record<string, unknown> };
  };

  updatePayment = async (input: UpdatePaymentInput): Promise<UpdatePaymentOutput> => {
    if (this.options.debug) {
      console.info('[PayKit] Updating payment', input);
    }

    const { amount, currency_code } = validateRequiredKeys(
      ['amount', 'currency_code'],
      input as unknown as Record<string, string>,
      'Missing required payment ID',
    );

    if (!amount || !currency_code)
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required amount or currency code');

    const { id: paymentId } = validateRequiredKeys(
      ['id'],
      input.data as Record<string, string>,
      'Missing required payment ID',
    );

    if (!paymentId) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Missing required payment ID');

    const [paymentIntentResult, paymentIntentError] = await tryCatchAsync(
      this.paykit.payments.update(paymentId, {
        amount: Number(amount),
        currency: currency_code,
        metadata: input.data?.metadata ? (input.data.metadata as unknown as PaykitMetadata) : {},
        provider_metadata: input.data?.provider_metadata
          ? (input.data.provider_metadata as unknown as Record<string, unknown>)
          : undefined,
      }),
    );

    if (paymentIntentError)
      throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, paymentIntentError.message);

    return { data: paymentIntentResult as unknown as Record<string, unknown> };
  };

  getWebhookActionAndData = async (payload: ProviderWebhookPayload['payload']): Promise<WebhookActionResult> => {
    if (this.options.debug) {
      console.info('[PayKit] Getting webhook action and data', payload);
    }

    const { rawData, headers } = payload;

    const fullUrl = ((): string => {
      if (headers['origin']) {
        return headers['origin'] as string;
      }

      // Behind a proxy (most common in production)
      if (headers['x-forwarded-host']) {
        const protocol = headers['x-forwarded-proto'] || 'https';
        const host = headers['x-forwarded-host'];
        const path = headers['x-forwarded-path'] || '';
        return `${protocol}://${host}${path}`;
      }

      // Local development (without a proxy)
      if (headers['host']) {
        const protocol =
          headers['x-forwarded-proto'] || (String(headers['host']).includes('localhost') ? 'http' : 'https');
        const host = headers['host'];
        const path = headers['x-original-url'] || headers['x-forwarded-path'] || '';
        return `${protocol}://${host}${path}`;
      }

      return '';
    })();

    const webhook = this.paykit.webhooks
      .setup({ webhookSecret: this.options.webhookSecret })
      .on('payment.created', async event => {
        return {
          action: PaymentActions.PENDING,
          data: {
            session_id: event.data?.metadata?.session_id as string,
            amount: event.data?.amount,
          },
        };
      })
      .on('payment.updated', async event => {
        const statusActionMap: Record<PaymentStatus, string> = {
          pending: PaymentActions.PENDING,
          processing: PaymentActions.PENDING,
          requires_action: PaymentActions.REQUIRES_MORE,
          requires_capture: PaymentActions.AUTHORIZED,
          succeeded: PaymentActions.SUCCESSFUL,
          failed: PaymentActions.FAILED,
          canceled: PaymentActions.CANCELED,
        };

        return {
          action: event.data?.status ? statusActionMap[event.data.status] : PaymentActions.PENDING,
          data: {
            session_id: event.data?.metadata?.session_id as string,
            amount: event.data?.amount,
          },
        };
      })
      .on('payment.canceled', async event => {
        return {
          action: PaymentActions.CANCELED,
          data: {
            session_id: event.data?.metadata?.session_id as string,
            amount: event.data?.amount,
          },
        };
      });

    const webhookEvents = await webhook.handle({
      body: rawData as string,
      headers: headers as Record<string, string | string[]>,
      fullUrl,
    });

    return webhookEvents as unknown as WebhookActionResult;
  };
}
