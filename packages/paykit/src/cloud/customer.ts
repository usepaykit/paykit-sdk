import { Result } from '..';
import { HTTPClient } from '../http-client';
import {
  Customer,
  CreateCustomerParams,
  UpdateCustomerParams,
} from '../resources/customer';

export interface CustomerClientOptions {
  /**
   * The API key for the customer client.
   */
  apiKey: string;

  /**
   * The base URL for the customer client.
   */
  baseUrl: string;

  /**
   * The provider for the customer client.
   */
  provider: string;
}

export class CustomerClient {
  private client: HTTPClient;

  constructor(private options: CustomerClientOptions) {
    this.client = new HTTPClient({
      baseUrl: options.baseUrl,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'X-Provider': options.provider,
      },
      retryOptions: { max: 3, baseDelay: 1000, debug: true },
    });
  }

  private _parseResponse = <T>(response: Result<T>): T => {
    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    return response.value;
  };

  create = async (params: CreateCustomerParams, pId?: string): Promise<Customer> => {
    const urlParams = new URLSearchParams({
      ...(pId && { _pId: pId }),
    });

    return this._parseResponse(
      await this.client.post<Customer>(`/v1/customers?${urlParams.toString()}`, {
        body: JSON.stringify(params),
      }),
    );
  };

  query = async (
    params: Partial<Pick<Customer, 'email' | 'phone' | 'name'>>,
    pId?: string,
  ): Promise<Customer[]> => {
    const urlParams = new URLSearchParams({
      ...(params.email && { email: params.email }),
      ...(params.phone && { phone: params.phone }),
      ...(params.name && { name: params.name }),
      ...(pId && { _pId: pId }),
    });

    return this._parseResponse(
      await this.client.get<Customer[]>(`/v1/customers/query?${urlParams.toString()}`),
    );
  };

  update = async (
    id: string,
    params: UpdateCustomerParams,
    pId?: string,
  ): Promise<Customer> => {
    const urlParams = new URLSearchParams({
      ...(pId && { _pId: pId }),
    });

    return this._parseResponse(
      await this.client.put<Customer>(`/v1/customers/${id}?${urlParams.toString()}`, {
        body: JSON.stringify(params),
      }),
    );
  };

  retrieve = async (id: string, pId?: string): Promise<Customer> => {
    const urlParams = new URLSearchParams({
      ...(pId && { _pId: pId }),
    });

    return this._parseResponse(
      await this.client.get<Customer>(`/v1/customers/${id}?${urlParams.toString()}`),
    );
  };

  delete = async (id: string, pId?: string): Promise<void> => {
    const urlParams = new URLSearchParams({
      ...(pId && { _pId: pId }),
    });

    return this._parseResponse(
      await this.client.delete<void>(`/v1/customers/${id}?${urlParams.toString()}`),
    );
  };
}
