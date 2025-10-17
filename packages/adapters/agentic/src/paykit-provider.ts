import {
  ConfigurationError,
  PayKitProvider,
  parseJSON,
  providerSchema,
} from '@paykit-sdk/core';
import { AgenticBuyer } from './schema/agentic-buyer';
import {
  AgenticCheckoutSession,
  CreateAgenticCheckoutSessionParams,
  createAgenticCheckoutSessionParamsSchema,
  UpdateAgenticCheckoutSessionParams,
} from './schema/agentic-checkout';
import {
  DelegatePaymentParams,
  DelegatePaymentResponse,
} from './schema/delegate-payment';
import { agenticBuyerToCustomer } from './utils/mapper';
import { agenticCheckoutSession$InboundSchema } from './utils/mapper';

export class PaykitAgenticAdapter {
  constructor(private provider: PayKitProvider) {
    const { error } = providerSchema.safeParse(provider);

    if (error) {
      throw new ConfigurationError(`Invalid ${provider.providerName} configuration`, {
        provider: provider.providerName,
        missingKeys: Object.keys(error.flatten().fieldErrors ?? {}),
      });
    }
  }

  createAgenticCheckoutSession = async (
    params: CreateAgenticCheckoutSessionParams,
  ): Promise<AgenticCheckoutSession> => {
    const {
      line2 = '',
      line1,
      city,
      state,
      country,
      postal_code,
    } = params.fulfillment_address ?? {};

    const checkout = await this.provider.createCheckout({
      customer: agenticBuyerToCustomer(params.buyer).id,
      session_type: params.checkout.session_type,
      item_id: params.checkout.item_id,
      quantity: params.checkout.quantity,
      subscription: params.checkout.subscription,
      metadata: {
        PAYKIT_METADATA_KEY: JSON.stringify({
          source: 'agentic',
          agent: {
            buyer: params.buyer,
            items: [{ id: params.checkout.item_id, quantity: params.checkout.quantity }],
            fulfillment_address: {
              name: `${params.buyer.first_name} ${params.buyer.last_name}`,
              line_one: line1,
              line_two: line2,
              city,
              state,
              country,
              postal_code,
            },
          },
        }),
      },
      provider_metadata: params.checkout.provider_metadata,
    });

    return agenticCheckoutSession$InboundSchema(
      checkout,
      parseJSON(
        JSON.parse(checkout.metadata?.PAYKIT_METADATA_KEY ?? '{}').agent ?? '{}',
        createAgenticCheckoutSessionParamsSchema,
      ),
      this.provider.providerName,
    );
  };

  updateAgenticCheckoutSession = async (
    _id: string,
    _params: UpdateAgenticCheckoutSessionParams,
  ): Promise<AgenticCheckoutSession> => {
    throw new Error('Not implemented');
  };

  retrieveAgenticCheckoutSession = async (
    id: string,
  ): Promise<AgenticCheckoutSession> => {
    const checkout = await this.provider.retrieveCheckout(id);

    if (!checkout) throw new Error('Checkout not found');

    return agenticCheckoutSession$InboundSchema(
      checkout,
      JSON.parse(checkout.metadata?.agenticParams ?? '{}'),
      this.provider.providerName,
    );
  };

  completeAgenticCheckoutSession = async (
    id: string,
    params: { buyer?: AgenticBuyer },
  ): Promise<AgenticCheckoutSession> => {
    throw new Error('Not Implemented');
  };

  cancelAgenticCheckoutSession = async (id: string): Promise<AgenticCheckoutSession> => {
    throw new Error('Not Implemented');
  };

  async delegatePayment(params: DelegatePaymentParams): Promise<DelegatePaymentResponse> {
    throw new Error('Not implemented');
  }
}
