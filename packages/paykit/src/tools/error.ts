import { PaymentProvider } from '../resources/providers';

/**
 * Base class for all HTTP errors.
 */

export class HTTPError extends Error {
  override readonly cause: unknown;
  override name = 'HTTPError';
  public readonly provider: PaymentProvider;

  constructor(message: string, opts: { cause?: unknown; provider: PaymentProvider }) {
    let msg = message;
    if (opts?.cause) {
      msg += `: ${opts.cause}`;
    }

    super(msg, opts);
    if (typeof this.cause === 'undefined') {
      this.cause = opts?.cause;
    }
    this.provider = opts.provider;
  }
}

export class PaykitUnauthorizedError extends HTTPError {
  override readonly name = 'PaykitUnauthorizedError';
}

export class PaykitConnectionError extends HTTPError {
  override readonly name = 'PaykitConnectionError';
}

export class PaykitAbortedError extends HTTPError {
  override readonly name = 'PaykitAbortedError';
}

export class PaykitTimeoutError extends HTTPError {
  override readonly name = 'PaykitTimeoutError';
}
