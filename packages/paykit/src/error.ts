/**
 * Base PayKit error class
 */
export class PayKitError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly provider?: string;
  public readonly method?: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    options?: {
      code?: string;
      statusCode?: number;
      provider?: string;
      method?: string;
      context?: Record<string, any>;
      cause?: Error;
    },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options?.code || 'PAYKIT_ERROR';
    this.statusCode = options?.statusCode || 500;
    this.provider = options?.provider;
    this.method = options?.method;
    this.context = options?.context;

    if (options?.cause) {
      this.cause = options.cause;
    }

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Method not implemented - for features that don't exist yet
 * Use this when a method is in the interface but not yet built
 */
export class NotImplementedError extends PayKitError {
  constructor(method: string, provider?: string, options?: { futureSupport?: boolean }) {
    const message = options?.futureSupport
      ? `${method} is not yet implemented${provider ? ` for ${provider}` : ''}. ` +
        `This feature is planned for a future release. ` +
        `If you need this urgently, please open an issue at https://github.com/usepaykit/paykit-sdk/issues`
      : `${method} is not implemented${provider ? ` for ${provider}` : ''}. ` +
        `If you believe this should be supported, please contact the maintainer at https://github.com/usepaykit/paykit-sdk/issues`;

    super(message, {
      code: 'NOT_IMPLEMENTED',
      statusCode: 501,
      provider,
      method,
    });
  }
}

/**
 * Provider limitation - the payment provider doesn't support this feature
 * Use this when the provider's API fundamentally doesn't have this capability
 */
export class ProviderNotSupportedError extends PayKitError {
  constructor(
    method: string,
    provider: string,
    options?: {
      reason?: string;
      alternative?: string;
    },
  ) {
    let message = `${provider} does not support ${method}.`;

    if (options?.reason) {
      message += ` ${options.reason}`;
    }

    if (options?.alternative) {
      message += ` Alternative: ${options.alternative}`;
    }

    super(message, {
      code: 'PROVIDER_NOT_SUPPORTED',
      statusCode: 501,
      provider,
      method,
      context: { reason: options?.reason, alternative: options?.alternative },
    });
  }
}

/**
 * Validation error - input data doesn't match schema
 * Use this for Zod validation failures or any input validation
 */
export class ValidationError extends PayKitError {
  constructor(
    message: string,
    options?: {
      field?: string;
      value?: any;
      provider?: string;
      method?: string;
      cause?: Error;
    },
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      provider: options?.provider,
      method: options?.method,
      context: { field: options?.field, value: options?.value },
      cause: options?.cause,
    });
  }

  /**
   * Helper to create ValidationError from Zod error
   */
  static fromZodError(
    zodError: any,
    provider?: string,
    method?: string,
  ): ValidationError {
    const message = zodError.message.split('\n').join(' ');
    return new ValidationError(message, {
      provider,
      method,
      cause: zodError,
    });
  }
}

/**
 * Resource not found error
 * Use when a requested resource doesn't exist
 */
export class ResourceNotFoundError extends PayKitError {
  constructor(resourceType: string, resourceId: string, provider?: string) {
    super(`${resourceType} with ID "${resourceId}" not found`, {
      code: 'RESOURCE_NOT_FOUND',
      statusCode: 404,
      provider,
      context: { resourceType, resourceId },
    });
  }
}

/**
 * Webhook error - issues with webhook processing
 * Use for webhook verification failures or event handling errors
 */
export class WebhookError extends PayKitError {
  constructor(message: string, options?: { provider?: string }) {
    super(message, {
      code: 'WEBHOOK_ERROR',
      statusCode: 400,
      provider: options?.provider,
      context: { provider: options?.provider },
    });
  }
}

/**
 * Configuration error - missing or invalid configuration
 * Use when required config is missing or invalid
 */
export class ConfigurationError extends PayKitError {
  constructor(
    message: string,
    options?: {
      provider?: string;
      missingKeys?: string[];
    },
  ) {
    super(message, {
      code: 'CONFIGURATION_ERROR',
      statusCode: 500,
      provider: options?.provider,
      context: { missingKeys: options?.missingKeys },
    });
  }
}

/**
 * Operation failed error - generic operation failure
 * Use when a provider operation fails unexpectedly
 */
export class OperationFailedError extends PayKitError {
  constructor(
    operation: string,
    provider?: string,
    options?: {
      reason?: string;
      cause?: Error;
    },
  ) {
    const message = `Failed to ${operation}${provider ? ` with ${provider}` : ''}${options?.reason ? `: ${options.reason}` : ''}`;

    super(message, {
      code: 'OPERATION_FAILED',
      statusCode: 500,
      provider,
      method: operation,
      cause: options?.cause,
    });
  }
}

/**
 * Authentication error - API key or auth issues
 * Use when provider authentication fails
 */
export class AuthenticationError extends PayKitError {
  constructor(provider: string, message?: string) {
    super(
      message ||
        `Authentication failed for ${provider}. Please check your API credentials.`,
      {
        code: 'AUTHENTICATION_ERROR',
        statusCode: 401,
        provider,
      },
    );
  }
}

/**
 * Rate limit error - too many requests
 * Use when hitting provider rate limits
 */
export class RateLimitError extends PayKitError {
  constructor(
    provider: string,
    options?: {
      retryAfter?: number;
      limit?: number;
    },
  ) {
    super(
      `Rate limit exceeded for ${provider}${options?.retryAfter ? `. Retry after ${options.retryAfter} seconds` : ''}`,
      {
        code: 'RATE_LIMIT_ERROR',
        statusCode: 429,
        provider,
        context: { retryAfter: options?.retryAfter, limit: options?.limit },
      },
    );
  }
}

/**
 * Invalid type error - wrong data type provided
 * Use when type coercion fails or wrong types are passed
 */
export class InvalidTypeError extends PayKitError {
  constructor(
    field: string,
    expectedType: string,
    receivedType: string,
    options?: {
      provider?: string;
      method?: string;
    },
  ) {
    super(
      `Invalid type for "${field}": expected ${expectedType}, received ${receivedType}`,
      {
        code: 'INVALID_TYPE',
        statusCode: 400,
        provider: options?.provider,
        method: options?.method,
        context: { field, expectedType, receivedType },
      },
    );
  }
}

/**
 * Constraint violation error - business logic constraint violated
 * Use for things like "metadata too long", "amount too small", etc.
 */
export class ConstraintViolationError extends PayKitError {
  constructor(
    constraint: string,
    options?: {
      value?: any;
      limit?: any;
      provider?: string;
    },
  ) {
    super(
      `Constraint violation: ${constraint}${options?.limit ? ` (limit: ${options.limit}, received: ${options.value})` : ''}`,
      {
        code: 'CONSTRAINT_VIOLATION',
        statusCode: 400,
        provider: options?.provider,
        context: { constraint, value: options?.value, limit: options?.limit },
      },
    );
  }
}
