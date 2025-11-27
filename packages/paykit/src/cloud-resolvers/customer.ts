import { HTTPClient } from '../http-client';
import {
  Customer,
  CreateCustomerParams,
  UpdateCustomerParams,
} from '../resources/customer';

export interface CustomerClientOptions {
  apiKey: string;
}

export class CustomerClient {
  private client: HTTPClient;

  constructor(private options: CustomerClientOptions) {
    this.client = new HTTPClient({
      baseUrl: 'https://api.usepaykit.dev/customers',
      headers: { Authorization: `Bearer ${options.apiKey}` },
      retryOptions: { max: 3, baseDelay: 1000, debug: true },
    });
  }

  async create(provider: string, params: CreateCustomerParams): Promise<Customer> {
    const response = await this.client.post<Customer>('/v1/customers', {
      body: JSON.stringify({
        ...params,
        provider,
      }),
    });

    if (!response.ok || !response.value) {
      throw new Error('Failed to create customer');
    }

    return response.value;
  }

  async retrieve(id: string): Promise<Customer | null> {
    const response = await this.client.get<Customer>(`/v1/customers/${id}`);

    if (!response.ok) {
      if ((response.error as { status?: number })?.status === 404) return null;
      throw new Error('Failed to retrieve customer');
    }

    return response.value || null;
  }

  async retrieveByEmail(provider: string, email: string): Promise<Customer | null> {
    const response = await this.client.get<Customer>(
      `/v1/customers?email=${encodeURIComponent(email)}&provider=${encodeURIComponent(provider)}`,
    );

    if (!response.ok) {
      if ((response.error as { status?: number })?.status === 404) return null;
      throw new Error('Failed to retrieve customer');
    }

    return response.value || null;
  }

  async update(id: string, params: UpdateCustomerParams): Promise<Customer> {
    const response = await this.client.patch<Customer>(`/v1/customers/${id}`, {
      body: JSON.stringify(params),
    });

    if (!response.ok || !response.value) {
      throw new Error('Failed to update customer');
    }

    return response.value;
  }

  async delete(id: string): Promise<void> {
    const response = await this.client.delete(`/v1/customers/${id}`);

    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  }
}
