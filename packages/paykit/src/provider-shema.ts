import { z } from 'zod';
import { PayKitProvider } from './paykit-provider';

export const providerSchema = z.custom<PayKitProvider>(
  (provider: PayKitProvider) => {
    if (!provider || typeof provider !== 'object') return false;

    const isNamed = 'providerName' in provider && typeof provider.providerName === 'string';

    if (!isNamed) return false;

    type MethodNames = {
      [K in keyof PayKitProvider]: PayKitProvider[K] extends (...args: any[]) => any ? K : never;
    }[keyof PayKitProvider & string];

    // List of all required methods that must be implemented
    const requiredMethods: Array<MethodNames> = [
      'createCheckout',
      'retrieveCheckout',
      'updateCheckout',
      'deleteCheckout',
      'createCustomer',
      'updateCustomer',
      'retrieveCustomer',
      'deleteCustomer',
      'createSubscription',
      'updateSubscription',
      'cancelSubscription',
      'deleteSubscription',
      'retrieveSubscription',
      'createPayment',
      'updatePayment',
      'retrievePayment',
      'deletePayment',
      'capturePayment',
      'cancelPayment',
      'createRefund',
      'handleWebhook',
    ];

    // Verify all required methods are implemented as functions
    return requiredMethods.every(method => typeof provider[method] === 'function');
  },
  {
    message: 'Invalid PayKit provider: must implement PayKitProvider interface with all required methods and providerName property',
  },
);
