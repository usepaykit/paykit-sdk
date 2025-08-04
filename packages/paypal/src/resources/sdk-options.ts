export interface PayPalSDKOptions {
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
  authWebhookId: string;
}

export interface PayPalAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface PayPalRequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}
