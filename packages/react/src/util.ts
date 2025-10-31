export interface PayKitClientErrorData {
  message: string;
  code?: string;
  statusCode: number;
  provider?: string;
  method?: string;
  context?: Record<string, unknown>;
}

export class PayKitClientError extends Error {
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly provider?: string;
  public readonly method?: string;
  public readonly context?: Record<string, unknown>;

  constructor(errorData: PayKitClientErrorData) {
    super(errorData.message);
    this.name = 'PayKitClientError';
    this.code = errorData.code;
    this.statusCode = errorData.statusCode;
    this.provider = errorData.provider;
    this.method = errorData.method;
    this.context = errorData.context;
  }
}

export const parsePayKitClientError = (
  response: Response,
  errorData: unknown,
): PayKitClientError => {
  // If errorData is already a proper error response object
  if (errorData && typeof errorData === 'object' && 'message' in errorData) {
    const data = errorData as PayKitClientErrorData;
    return new PayKitClientError({
      message: data.message,
      code: data.code,
      statusCode: data.statusCode || response.status,
      provider: data.provider,
      method: data.method,
      context: data.context,
    });
  }

  // Fallback for generic error responses
  return new PayKitClientError({
    message:
      typeof errorData === 'string'
        ? errorData
        : (errorData as PayKitClientErrorData)?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
    statusCode: response.status,
    provider: (errorData as PayKitClientErrorData)?.provider,
    method: (errorData as PayKitClientErrorData)?.method,
    context: (errorData as PayKitClientErrorData)?.context,
  });
};
