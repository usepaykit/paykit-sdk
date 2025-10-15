import type {
  Checkout,
  CreateCheckoutSchema,
  UpdateCheckoutSchema,
  Customer,
  CreateCustomerParams,
  UpdateCustomerParams,
  Subscription,
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
  Payment,
  CreatePaymentSchema,
  UpdatePaymentSchema,
  CapturePaymentSchema,
  Refund,
  CreateRefundSchema,
} from '../resources';

export interface PayKitEndpoints {
  '/customer/create': { args: [params: CreateCustomerParams]; return: Customer };
  '/customer/retrieve': { args: [id: string]; return: Customer | null };
  '/customer/update': { args: [id: string, params: UpdateCustomerParams]; return: Customer };
  '/customer/delete': { args: [id: string]; return: null };

  '/checkout/create': { args: [params: CreateCheckoutSchema]; return: Checkout };
  '/checkout/retrieve': { args: [id: string]; return: Checkout | null };
  '/checkout/update': { args: [id: string, params: UpdateCheckoutSchema]; return: Checkout };
  '/checkout/delete': { args: [id: string]; return: null };

  '/subscription/create': { args: [params: CreateSubscriptionSchema]; return: Subscription };
  '/subscription/retrieve': { args: [id: string]; return: Subscription | null };
  '/subscription/update': { args: [id: string, params: UpdateSubscriptionSchema]; return: Subscription };
  '/subscription/cancel': { args: [id: string]; return: Subscription };
  '/subscription/delete': { args: [id: string]; return: null };

  '/payment/create': { args: [params: CreatePaymentSchema]; return: Payment };
  '/payment/retrieve': { args: [id: string]; return: Payment | null };
  '/payment/update': { args: [id: string, params: UpdatePaymentSchema]; return: Payment };
  '/payment/capture': { args: [id: string, params: CapturePaymentSchema]; return: Payment };
  '/payment/cancel': { args: [id: string]; return: Payment };
  '/payment/delete': { args: [id: string]; return: null };

  // Refunds
  '/refund/create': { args: [params: CreateRefundSchema]; return: Refund };
}

export type EndpointPath = keyof PayKitEndpoints;
export type EndpointArgs<T extends EndpointPath> = PayKitEndpoints[T]['args'];
export type EndpointReturn<T extends EndpointPath> = PayKitEndpoints[T]['return'];
export type EndpointHandler<T extends EndpointPath> = (...args: EndpointArgs<T>) => Promise<EndpointReturn<T>>;
