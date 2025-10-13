import { HTTPClient, OperationFailedError } from '@paykit-sdk/core';
import { GoPayOptions } from '../gopay-provider';
import { GoPayTokenResponse } from '../schema';

export class AuthController {
  private _client: HTTPClient;
  private _accessToken: string | null = null;

  constructor(private opts: GoPayOptions & { baseUrl: string }) {
    const debug = opts.debug ?? true;

    this._client = new HTTPClient({ baseUrl: this.opts.baseUrl, headers: {}, retryOptions: { max: 3, baseDelay: 1000, debug } });
  }

  getAccessToken = async () => {
    if (this._accessToken) {
      const [token, , expiryStr] = this._accessToken.split('::paykit::');
      const expiry = parseInt(expiryStr || '0', 10);
      if (expiry > Date.now()) return token;
    }

    // Generate a new one
    const credentials = Buffer.from(`${this.opts.clientId}:${this.opts.clientSecret}`).toString('base64');
    const response = await this._client.post<GoPayTokenResponse>('/oauth2/token', {
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'payment-all' }).toString(),
    });

    if (!response.ok || !response.value.access_token) {
      throw new OperationFailedError('getAccessToken', 'gopay', {
        cause: new Error('Failed to obtain GoPay access token'),
      });
    }

    // Set expiry 5 minutes before actual expiry
    const expiryTime = Date.now() + (response.value.expires_in - 300) * 1000;
    const accessToken = `${response.value.access_token}::paykit::${expiryTime}`;
    this._accessToken = accessToken;

    return accessToken;
  };

  getAuthHeaders = async () => {
    const token = await this.getAccessToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' };
  };
}
