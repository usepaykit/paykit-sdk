import { HTTPClient } from '@paykit-sdk/core';
import { Client, OAuthAuthorizationController } from '@paypal/paypal-server-sdk';
import { PayPalConfig } from '../paypal-provider';

export const MAX_METADATA_LENGTH = 127;

export class PayPalCoreApi {
  private _client: HTTPClient;
  private authController: OAuthAuthorizationController;
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor(client: Client, config: PayPalConfig) {
    this.authController = new OAuthAuthorizationController(client);
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseUrl = config.isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    this._client = new HTTPClient({
      baseUrl: this.baseUrl,
      headers: {},
    });
  }

  getAccessToken = async () => {
    const authorization = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const authRes = await this.authController.requestToken({ authorization: `Basic ${authorization}` });

    if (!authRes.result.accessToken) {
      throw new Error('Failed to get access token');
    }

    return authRes.result.accessToken;
  };

  verifyWebhook = async ({ headers, body }: { headers: Record<string, string | string[]>; body: string }): Promise<{ success: boolean }> => {
    const accessToken = await this.getAccessToken();

    const res = await this._client.post<{ verification_status: 'SUCCESS' | 'FAILURE' }>('/v1/notifications/verify-webhook-signature', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: headers['webhook-id'],
        webhook_event: JSON.parse(body),
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to verify webhook`);
    }

    if (res.value?.verification_status !== 'SUCCESS') return { success: false };

    return { success: true };
  };
}
