import * as React from 'react';
import { EndpointPath } from '@paykit-sdk/core';
import { parsePayKitClientError, PayKitClientError } from '../util';

type AsyncResult<T> =
  | [data: T, error: undefined]
  | [data: undefined, error: PayKitClientError];

type HeadersEsque = Record<string, string> | (() => Record<string, string>);

export const useAsyncFn = <Args extends unknown[], Response>(
  path: EndpointPath,
  apiUrl: string,
  headersEsque?: HeadersEsque,
) => {
  const [loading, setLoading] = React.useState(false);

  const run = React.useCallback(
    async (...args: Args): Promise<AsyncResult<Response>> => {
      setLoading(true);

      try {
        const headers =
          typeof headersEsque === 'function' ? headersEsque() : (headersEsque ?? {});

        const res = await fetch(`${apiUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          credentials: 'include',
          body: JSON.stringify({ args }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            message: res.statusText || 'Request failed',
          }));
          throw parsePayKitClientError(res, errorData);
        }

        const response = await res.json();

        if (typeof response === 'object' && 'result' in response) {
          return [response.result, undefined];
        }

        throw new PayKitClientError({
          message:
            "Unknown response format (API must return JSON with a top-level 'result' property)",
          statusCode: 500,
          context: {
            response: JSON.stringify(response, null, 2),
          },
        });
      } catch (err) {
        const error =
          err instanceof PayKitClientError
            ? err
            : new PayKitClientError({
                message:
                  err instanceof Error ? err.message : 'An unexpected error occurred',
                statusCode: err instanceof Error ? 0 : 500,
              });

        return [undefined, error];
      } finally {
        setLoading(false);
      }
    },
    [path, apiUrl, headersEsque],
  );

  return { run, loading };
};
