import { ERR, OK, Result, buildError, executeWithRetryWithHandler } from './tools';
import { classifyError } from './tools/classify-error';

export type HTTPClientConfig = {
  baseUrl: string;
  headers: Record<string, string>;
  retryOptions: { max: number; baseDelay: number; debug: boolean };
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
    return {
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers,
      },
      ...options,
    };
  }

  private retryErrorHandler = (error: unknown, attempt: number) => {
    const errorType = classifyError(error);
    const retryableTypes = [
      'rate_limit',
      'connection',
      'timeout',
      'internal_server_error',
      'bad_gateway',
      'service_unavailable',
      'gateway_timeout',
    ];

    const shouldRetry = retryableTypes.includes(errorType);

    if (this.config.retryOptions.debug) {
      console.info(
        `[HTTPClient] Attempt ${attempt} failed: ${classifyError(error)} - Retry: ${shouldRetry}`,
      );
    }

    return { retry: shouldRetry, data: null };
  };

  private async withRetry<T>(apiCall: () => Promise<Result<T>>): Promise<Result<T>> {
    return executeWithRetryWithHandler(
      apiCall,
      this.retryErrorHandler,
      this.config.retryOptions.max,
      this.config.retryOptions.baseDelay,
    );
  }

  get = async <T>(
    endpoint: string,
    options?: Omit<RequestInit, 'method'>,
  ): Promise<Result<T>> => {
    return this.withRetry(async () => {
      const url = this.getFullUrl(endpoint);
      const requestOptions = this.getRequestOptions(options);

      const res = await fetch(url, { method: 'GET', ...requestOptions });

      const data = (await res.json()) as T;

      if (!res.ok) {
        return ERR(
          buildError(
            classifyError(new Error(`${res.status}: ${JSON.stringify(data)}`)),
            data,
          ),
        );
      }
      return OK(data);
    });
  };

  post = async <T>(
    endpoint: string,
    options?: Omit<RequestInit, 'method'>,
  ): Promise<Result<T>> => {
    return this.withRetry(async () => {
      const url = this.getFullUrl(endpoint);
      const requestOptions = this.getRequestOptions(options);
      const res = await fetch(url, { method: 'POST', ...requestOptions });

      const data = (await res.json()) as T;

      if (!res.ok) {
        return ERR(
          buildError(
            classifyError(new Error(`${res.status}: ${JSON.stringify(data)}`)),
            data,
          ),
        );
      }

      return OK(data);
    });
  };

  delete = async <T>(
    endpoint: string,
    options?: Omit<RequestInit, 'method'>,
  ): Promise<Result<T>> => {
    return this.withRetry(async () => {
      const url = this.getFullUrl(endpoint);
      const requestOptions = this.getRequestOptions(options);
      return await fetch(url, { method: 'DELETE', ...requestOptions })
        .then(res => OK(res.json() as T))
        .catch(err => this.errorHandler(err));
    });
  };

  put = async <T>(
    endpoint: string,
    options?: Omit<RequestInit, 'method'>,
  ): Promise<Result<T>> => {
    return this.withRetry(async () => {
      const url = this.getFullUrl(endpoint);
      const requestOptions = this.getRequestOptions(options);
      return await fetch(url, { method: 'PUT', ...requestOptions })
        .then(res => OK(res.json() as T))
        .catch(err => this.errorHandler(err));
    });
  };

  patch = async <T>(
    endpoint: string,
    options?: Omit<RequestInit, 'method'>,
  ): Promise<Result<T>> => {
    return this.withRetry(async () => {
      const url = this.getFullUrl(endpoint);
      const requestOptions = this.getRequestOptions(options);
      return await fetch(url, { method: 'PATCH', ...requestOptions })
        .then(res => OK(res.json() as T))
        .catch(err => this.errorHandler(err));
    });
  };
}
