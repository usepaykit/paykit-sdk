import { setTimeout } from 'timers/promises';
import { z } from 'zod';
import { tryCatchSync } from './try-catch';

export type Result<T, E = unknown> = { ok: true; value: T; error?: never } | { ok: false; value?: never; error: E };

export const OK = <V>(value: V): Result<V, never> => ({ ok: true, value });

export const ERR = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const unwrapAsync = async <T>(pr: Promise<Result<T, unknown>>): Promise<T> => {
  const r = await pr;

  if (!r.ok) throw r.error;

  return r.value;
};

export function safeParse<Inp, Out>(rawValue: Inp, fn: (value: Inp) => Out, errorMessage: string): Result<Out, Error> {
  const [result, error] = tryCatchSync(() => fn(rawValue));

  if (error) return ERR(buildError(errorMessage, error));

  return OK(result);
}

export const safeEncode = <T>(value: T) => {
  return safeParse(value, value => Buffer.from(JSON.stringify(value)).toString('base64'), 'Failed to encode value');
};

export const safeDecode = <T>(value: string) => {
  return safeParse(value, value => JSON.parse(Buffer.from(value, 'base64').toString('utf-8')) as T, 'Failed to decode value');
};

export async function executeWithRetryWithHandler<T>(
  apiCall: () => Promise<T>,
  errorHandler: (error: any, attempt: number) => { retry: boolean; data: unknown },
  maxRetries: number = 3,
  baseDelay: number = 1000,
  currentAttempt: number = 1,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    const handledError = errorHandler(error, currentAttempt);

    if (!handledError.retry) return handledError.data as T;

    if (handledError.retry && currentAttempt <= maxRetries) {
      const delay = baseDelay * Math.pow(2, currentAttempt - 1) * (0.5 + Math.random() * 0.5);

      await setTimeout(delay);

      return executeWithRetryWithHandler(apiCall, errorHandler, maxRetries, baseDelay, currentAttempt + 1);
    }

    return handledError.data as T;
  }
}

export function buildError(message: string, cause?: unknown): Error {
  const error = new Error(message);

  if (cause) error.cause = cause;

  return error;
}

export const validateRequiredKeys = <K extends string, S extends Record<string, any>>(
  requiredKeys: readonly K[],
  source: S,
  errorMessage: string | ((missingKeys: K[]) => string),
): S => {
  const missingKeys: K[] = [];
  const result: Partial<S> = {};

  for (const key of requiredKeys) {
    const value = source[key];
    if (!value) {
      missingKeys.push(key);
    } else {
      result[key] = value;
    }
  }

  if (missingKeys.length > 0) {
    const missingKeysList = missingKeys.join(', ');
    const error = typeof errorMessage === 'function' ? errorMessage(missingKeys) : errorMessage.replace('{keys}', missingKeysList);
    throw new Error(error);
  }

  return result as S;
};

export const parseJSON = <T>(str: string, schema: z.ZodSchema<T>): T => {
  const parsed = JSON.parse(str);
  return schema.parse(parsed);
};
