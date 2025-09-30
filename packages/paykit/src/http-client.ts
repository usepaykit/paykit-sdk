import { ERR, OK, Result, buildError } from './tools';
import { classifyError } from './tools/classify-error';

export type HTTPClientConfig = {
  baseUrl: string;
  headers: Record<string, string>;
};

export class HTTPClient {
  constructor(private config: HTTPClientConfig) {}

  private errorHandler = (err: unknown) => {
    const errorType = classifyError(err);
    return ERR(buildError(errorType, err));
  };

  private getFullUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.config.baseUrl}/${cleanEndpoint}`;
  }

  private getRequestOptions(options?: Omit<RequestInit, 'method'>): RequestInit {
    return { headers: { 'Content-Type': 'application/json', ...this.config.headers, ...options?.headers }, ...options };
  }

  async get<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<Result<T>> {
    const url = this.getFullUrl(endpoint);
    const requestOptions = this.getRequestOptions(options);

    return await fetch(url, { method: 'GET', ...requestOptions })
      .then(res => OK(res.json() as T))
      .catch(err => this.errorHandler(err));
  }

  async post<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<Result<T>> {
    const url = this.getFullUrl(endpoint);
    const requestOptions = this.getRequestOptions(options);

    return await fetch(url, { method: 'POST', ...requestOptions })
      .then(res => OK(res.json() as T))
      .catch(err => this.errorHandler(err));
  }

  async delete<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<Result<T>> {
    const url = this.getFullUrl(endpoint);
    const requestOptions = this.getRequestOptions(options);

    return await fetch(url, { method: 'DELETE', ...requestOptions })
      .then(res => OK(res.json() as T))
      .catch(err => this.errorHandler(err));
  }

  async put<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<Result<T>> {
    const url = this.getFullUrl(endpoint);
    const requestOptions = this.getRequestOptions(options);

    return await fetch(url, { method: 'PUT', ...requestOptions })
      .then(res => OK(res.json() as T))
      .catch(err => this.errorHandler(err));
  }

  async patch<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<Result<T>> {
    const url = this.getFullUrl(endpoint);
    const requestOptions = this.getRequestOptions(options);

    return await fetch(url, { method: 'PATCH', ...requestOptions })
      .then(res => OK(res.json() as T))
      .catch(err => this.errorHandler(err));
  }
}
