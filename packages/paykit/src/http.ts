import {
  AbortedError,
  TimeoutError,
  ERR,
  isConnectionError,
  isUnauthorizedError,
  OK,
  Result,
  UnauthorizedError,
  isTimeoutError,
  isAbortError,
  UnknownError,
  ConnectionError,
} from './tools';

export type HTTPClientConfig = {
  baseUrl: string;
  headers: Record<string, string>;
};

export class HTTPClient {
  constructor(private config: HTTPClientConfig) {}

  private errorHandler = (err: unknown) => {
    switch (true) {
      case isUnauthorizedError(err):
        return ERR(new UnauthorizedError('Unauthorized', { provider: 'gumroad' }));
      case isConnectionError(err):
        return ERR(new ConnectionError('Connection error', { provider: 'gumroad' }));
      case isTimeoutError(err):
        return ERR(new TimeoutError('Timeout error', { cause: err, provider: 'gumroad' }));
      case isAbortError(err):
        return ERR(new AbortedError('Aborted error', { provider: 'gumroad' }));
      default:
        return ERR(new UnknownError('Unknown error', { cause: err, provider: 'gumroad' }));
    }
  };

  private getFullUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.config.baseUrl}/${cleanEndpoint}`;
  }

  private getRequestOptions(options?: Omit<RequestInit, 'method'>): RequestInit {
    return {
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers,
      },
      ...options,
    };
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
