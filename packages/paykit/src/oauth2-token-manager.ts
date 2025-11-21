import { OperationFailedError } from './error';
import { HTTPClient } from './http-client';

export interface OAuth2TokenResponse {
  accessToken: string;
  expiresIn: number; // seconds
}

export interface OAuth2TokenManagerConfig {
  /**
   * HTTPClient instance for making token requests
   */
  client: HTTPClient;

  /**
   * Provider name for error messages
   */
  provider: string;

  /**
   * Token endpoint path (e.g., '/oauth2/token')
   */
  tokenEndpoint: string;

  /**
   * Credentials for Basic auth (username:password format)
   */
  credentials: { username: string; password: string };

  /**
   * Adapter function to extract token and expiry from provider response
   */
  responseAdapter: (response: Record<string, any>) => OAuth2TokenResponse;

  /**
   * Optional request body
   */
  requestBody?: string | URLSearchParams;

  /**
   * Optional request headers
   */
  requestHeaders?: Record<string, string>;

  /**
   * Optional expiry buffer in seconds (defaults to 300 = 5 minutes)
   */
  expiryBuffer?: number;

  /**
   * Optional additional headers to include in getAuthHeaders()
   */
  authHeaders?: Record<string, string>;
}

/**
 * Manages OAuth2 access tokens with automatic refresh and caching
 */
export class OAuth2TokenManager {
  private _accessToken: string | null = null;
  private readonly config: Required<
    Omit<OAuth2TokenManagerConfig, 'requestBody' | 'requestHeaders' | 'authHeaders'>
  > &
    Pick<OAuth2TokenManagerConfig, 'requestBody' | 'requestHeaders' | 'authHeaders'>;

  constructor(config: OAuth2TokenManagerConfig) {
    this.config = {
      ...config,
      expiryBuffer: config.expiryBuffer ?? 300,
    };
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  getToken = async (): Promise<string> => {
    // Check if cached token is still valid
    if (this._accessToken) {
      const [token, , expiryStr] = this._accessToken.split('::paykit::');
      const expiry = parseInt(expiryStr || '0', 10);
      if (expiry > Date.now()) {
        return token;
      }
    }

    // Refresh token
    const credentials = Buffer.from(
      `${this.config.credentials.username}:${this.config.credentials.password}`,
    ).toString('base64');

    const headers = {
      Authorization: `Basic ${credentials}`,
      ...(this.config.requestHeaders && { ...this.config.requestHeaders }),
    };

    const response = await this.config.client.post(this.config.tokenEndpoint, {
      headers,
      ...(this.config.requestBody && { body: this.config.requestBody }),
    });

    if (!response.ok) {
      throw new OperationFailedError('getAccessToken', this.config.provider, {
        cause: new Error(
          `Failed to obtain access token: ${JSON.stringify(response.value || response.error)}`,
        ),
      });
    }

    // Extract token and expiry using adapter
    const tokenData = this.config.responseAdapter(response.value as Record<string, any>);

    if (!tokenData.accessToken || !tokenData.expiresIn) {
      throw new OperationFailedError('getAccessToken', this.config.provider, {
        cause: new Error('Invalid token response: missing accessToken or expiresIn'),
      });
    }

    // Cache token with expiry (subtract buffer for safety)
    const expiryTime =
      Date.now() + (tokenData.expiresIn - this.config.expiryBuffer) * 1000;
    this._accessToken = `${tokenData.accessToken}::paykit::${expiryTime}`;

    return tokenData.accessToken;
  };

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await this.getToken();

    return {
      Authorization: `Bearer ${token}`,
      ...(this.config.authHeaders && { ...this.config.authHeaders }),
    };
  };
}
