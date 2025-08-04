export const PAYPAL_ENDPOINTS = {
  /**
   * API
   */
  LIVE: 'https://api-m.paypal.com',
  SANDBOX: 'https://api-m.sandbox.paypal.com',

  /**
   * Checkout
   */
  CREATE_ORDER: '/v2/checkout/orders',
  GET_ORDER: '/v2/checkout/orders/{id}',
  PATCH_ORDER: '/v2/checkout/orders/{id}',
  AUTHORIZE_ORDER: '/v2/checkout/orders/{id}/authorize',

  /**
   * Auth
   */
  AUTH: '/v1/oauth2/token',

  /**
   * Payment
   */
  CAPTURE_REFUND: '/v2/payments/captures/{id}/refund',
  AUTHORIZATION_VOID: '/v2/payments/authorizations/{id}/void',
  AUTHORIZATION_CAPTURE: '/v2/payments/authorizations/{id}/capture',
  AUTHORIZATION_GET: '/v2/payments/authorizations/{id}',

  /**
   * Customers
   */
  RETRIEVE_CUSTOMER: '/v1/customers/{id}',

  /**
   * Subscriptions
   */
  RETRIEVE_SUBSCRIPTION: '/v1/billing/subscriptions/{id}',
  CREATE_SUBSCRIPTION: '/v1/billing/subscriptions',
  CANCEL_SUBSCRIPTION: '/v1/billing/subscriptions/{id}/cancel',
  UPDATE_SUBSCRIPTION: '/v1/billing/subscriptions/{id}',

  /**
   * Webhooks
   */
  VERIFY_WEBHOOK_SIGNATURE: '/v1/notifications/verify-webhook-signature',
} as const;
