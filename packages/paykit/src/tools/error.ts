/**
 * Base class for all HTTP errors.
 */

export class HTTPError extends Error {
  override readonly cause: unknown;
  override name = 'HTTPError';

  constructor(message: string, opts: { cause?: unknown }) {
    let msg = message;
    if (opts?.cause) {
      msg += `: ${opts.cause}`;
    }

    super(msg, opts);
    if (typeof this.cause === 'undefined') {
      this.cause = opts?.cause;
    }
  }
}

export class UnauthorizedError extends HTTPError {
  override readonly name = 'PaykitUnauthorizedError';
}

export class ConnectionError extends HTTPError {
  override readonly name = 'PaykitConnectionError';
}

export class AbortedError extends HTTPError {
  override readonly name = 'PaykitAbortedError';
}

export class TimeoutError extends HTTPError {
  override readonly name = 'PaykitTimeoutError';
}

export class ValidationError extends HTTPError {
  override readonly name = 'PaykitValidationError';
}

export class UnknownError extends HTTPError {
  override readonly name = 'PaykitUnknownError';
}
