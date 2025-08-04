import { HTTPClient, isUnauthorizedError, Result } from '@paykit-sdk/core';
import { PAYPAL_ENDPOINTS } from '../resources/endpoints';
import { PayPalRequestOptions, PayPalAuthResponse, PayPalSDKOptions } from '../resources/sdk-options';

export class PayPalClient {
  private httpClient: HTTPClient;
  private options: PayPalSDKOptions;
  private accessToken?: string;
  private static readonly MAX_ATTEMPTS = 3;

  constructor(options: PayPalSDKOptions) {
    const baseUrl = options.sandbox ? PAYPAL_ENDPOINTS.SANDBOX : PAYPAL_ENDPOINTS.LIVE;

    this.httpClient = new HTTPClient({
      baseUrl,
      headers: {},
    });

    this.options = options;
  }

  authenticate = async (): Promise<void> => {
    const authString = btoa(`${this.options.clientId}:${this.options.clientSecret}`);

    const { ok, value, error } = await this.httpClient.post<PayPalAuthResponse>(PAYPAL_ENDPOINTS.AUTH, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authString}`,
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    if (ok) {
      this.accessToken = value.access_token;
    } else {
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  request = async <T>(options: PayPalRequestOptions): Promise<Result<T>> => {
    return this.retryIfNecessary<T>(options);
  };

  /**
   * Make the actual HTTP request using PayKit's HTTPClient
   */
  private async makeRequest<T>(config: PayPalRequestOptions): Promise<Result<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const requestOptions = { headers };

    let result: Result<T>;

    switch (config.method) {
      case 'GET':
        result = await this.httpClient.get(config.url, requestOptions);
        break;
      case 'POST':
        result = await this.httpClient.post(config.url, {
          ...requestOptions,
          body: config.data ? JSON.stringify(config.data) : undefined,
        });
        break;
      case 'PUT':
        result = await this.httpClient.put(config.url, {
          ...requestOptions,
          body: config.data ? JSON.stringify(config.data) : undefined,
        });
        break;
      case 'PATCH':
        result = await this.httpClient.patch(config.url, {
          ...requestOptions,
          body: config.data ? JSON.stringify(config.data) : undefined,
        });
        break;
      case 'DELETE':
        result = await this.httpClient.delete(config.url, requestOptions);
        break;
      default:
        result = await this.httpClient.post(config.url, {
          ...requestOptions,
          body: config.data ? JSON.stringify(config.data) : undefined,
        });
    }

    return result;
  }

  /**
   * Retry mechanism for handling 401 errors with token refresh
   */
  private retryIfNecessary = async <T>(
    config: PayPalRequestOptions,
    originalConfig?: PayPalRequestOptions,
    retryCount: number = 0,
  ): Promise<Result<T>> => {
    if (retryCount > PayPalClient.MAX_ATTEMPTS) {
      throw new Error(`An error occurred while requesting PayPal API after ${PayPalClient.MAX_ATTEMPTS} attempts`);
    }

    try {
      const response = await this.makeRequest<T>(config);
      return response;
    } catch (err: unknown) {
      // Handle 401 errors by refreshing token and retrying
      if (isUnauthorizedError(err)) {
        retryCount++;

        if (!originalConfig) originalConfig = config;

        await this.authenticate();

        // Update config with new token
        const updatedConfig = {
          ...originalConfig,
          headers: { ...originalConfig.headers, Authorization: `Bearer ${this.accessToken}` },
        };

        return await this.makeRequest(updatedConfig);
      }

      throw err;
    }
  };
}
