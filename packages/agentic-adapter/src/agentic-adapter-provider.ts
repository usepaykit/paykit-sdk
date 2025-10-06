import { PayKitProvider } from '@paykit-sdk/core';
import _ from 'lodash';
import { agenticBuyerToCustomer } from './$inbound';
import { agenticCheckoutSession$InboundSchema } from './$inbound';
import { AgenticBuyer } from './schema/agentic-buyer';
import { AgenticCheckoutSession, CreateAgenticCheckoutSessionParams, UpdateAgenticCheckoutSessionParams } from './schema/agentic-checkout';
import { DelegatePaymentParams, DelegatePaymentResponse } from './schema/delegate-payment';

export class AgenticAdapterProvider {
  constructor(private baseProvider: PayKitProvider) {}

  createAgenticCheckoutSession = async (params: CreateAgenticCheckoutSessionParams): Promise<AgenticCheckoutSession> => {
    const checkout = await this.baseProvider.createCheckout({
      customer_id: agenticBuyerToCustomer(params.buyer).id,
      provider_metadata: { ...params },
      session_type: 'one_time',
      item_id: params.items[0].id,
      quantity: params.items[0].quantity,
      subscription: undefined,
      metadata: { agenticParams: JSON.stringify(params) },
    });

    return agenticCheckoutSession$InboundSchema(checkout, JSON.parse(checkout.metadata?.agenticParams ?? '{}'), this.baseProvider.providerName);
  };

  updateAgenticCheckoutSession = async (id: string, params: UpdateAgenticCheckoutSessionParams): Promise<AgenticCheckoutSession> => {
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
