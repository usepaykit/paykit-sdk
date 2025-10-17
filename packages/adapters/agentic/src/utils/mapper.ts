import { Checkout, Customer } from '@paykit-sdk/core';
import { AgenticBuyer } from '../schema/agentic-buyer';
import {
  AgenticCheckoutSession,
  CreateAgenticCheckoutSessionParams,
} from '../schema/agentic-checkout';

export const customerToAgenticBuyer = (customer: Customer) => {
  return {
    first_name: customer.name?.split(' ')[0],
    last_name: customer.name?.split(' ')[1],
    phone: customer.metadata?.phone,
    email: customer.email,
  };
};

export const agenticBuyerToCustomer = (buyer: AgenticBuyer) => {
  return {
    id: buyer.id,
    name: `${buyer.first_name} ${buyer.last_name}`,
    phone: buyer.phone,
    email: buyer.email,
    metadata: { phone: buyer.phone },
  };
};

export const agenticCheckoutSession$InboundSchema = (
  checkout: Checkout,
  agenticParams: CreateAgenticCheckoutSessionParams,
  providerName: string,
): AgenticCheckoutSession => {
  return {
    id: checkout.id,
    buyer: agenticParams.buyer,
    payment_provider: {
      provider: providerName.toLowerCase(),
      supported_payment_methods: ['card'],
    },
    status: 'in_progress',
    currency: checkout.currency,
    line_items: checkout.products,
    fulfillment_options:
      JSON.parse(JSON.stringify(checkout.metadata?.fulfillment_address ?? {})) ?? [],
    fulfillment_option_id: checkout.metadata?.fulfillment_option_id ?? null,
    totals: [],
    messages: [],
    order: null,
  };
};
