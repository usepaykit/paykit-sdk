import { PayKitProvider, parseJSON } from '@paykit-sdk/core';
import _ from 'lodash';
import { agenticBuyerToCustomer } from './$inbound';
import { agenticCheckoutSession$InboundSchema } from './$inbound';
import { AgenticBuyer } from './schema/agentic-buyer';
import {
  AgenticCheckoutSession,
  CreateAgenticCheckoutSessionParams,
  createAgenticCheckoutSessionParamsSchema,
  UpdateAgenticCheckoutSessionParams,
} from './schema/agentic-checkout';
import { DelegatePaymentParams, DelegatePaymentResponse } from './schema/delegate-payment';

export class PaykitAgenticCommerceAdapter {
  constructor(private baseProvider: PayKitProvider) {}

  createAgenticCheckoutSession = async (params: CreateAgenticCheckoutSessionParams): Promise<AgenticCheckoutSession> => {
    const checkout = await this.baseProvider.createCheckout({
      customer: agenticBuyerToCustomer(params.buyer).id,
      session_type: params.checkout.session_type,
      item_id: params.checkout.item_id,
      quantity: params.checkout.quantity,
      subscription: params.checkout.subscription,
      metadata: {
        _pk_agenticParams: JSON.stringify({
          buyer: params.buyer,
          items: [{ id: params.checkout.item_id, quantity: params.checkout.quantity }],
          fulfillment_address: params.fulfillment_address,
        }),
      },
      provider_metadata: params.checkout.provider_metadata,
    });

    return agenticCheckoutSession$InboundSchema(
      checkout,
      parseJSON(checkout.metadata?._pk_agenticParams ?? '{}', createAgenticCheckoutSessionParamsSchema),
      this.baseProvider.providerName,
    );
  };

  updateAgenticCheckoutSession = async (_id: string, _params: UpdateAgenticCheckoutSessionParams): Promise<AgenticCheckoutSession> => {
    throw new Error('Not implemented');
  };

  retrieveAgenticCheckoutSession = async (id: string): Promise<AgenticCheckoutSession> => {
    const checkout = await this.baseProvider.retrieveCheckout(id);

    if (!checkout) throw new Error('Checkout not found');

    return agenticCheckoutSession$InboundSchema(checkout, JSON.parse(checkout.metadata?.agenticParams ?? '{}'), this.baseProvider.providerName);
  };

  completeAgenticCheckoutSession = async (_id: string, _params: { buyer?: AgenticBuyer }): Promise<AgenticCheckoutSession> => {
    throw new Error('Not Implemented');
  };

  cancelAgenticCheckoutSession = async (id: string): Promise<AgenticCheckoutSession> => {
    throw new Error('Not Implemented');
  };

  async delegatePayment(params: DelegatePaymentParams): Promise<DelegatePaymentResponse> {
    throw new Error('Not implemented');
  }
}
