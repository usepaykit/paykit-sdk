import * as React from 'react';
import { EndpointPath } from '@paykit-sdk/core';

type AsyncResult<T> = [data: T, error: undefined] | [data: undefined, error: Error];

export const useAsyncFn = <Args extends unknown[], Response>(
  path: EndpointPath,
  apiUrl: string,
  headersEsque: Record<string, string> | (() => Record<string, string>),
) => {
  const [loading, setLoading] = React.useState(false);

  const run = React.useCallback(
    async (...args: Args): Promise<AsyncResult<Response>> => {
      setLoading(true);

      try {
        const headers = typeof headersEsque === 'function' ? headersEsque() : (headersEsque ?? {});

        const response = await fetch(`${apiUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          credentials: 'include',
          body: JSON.stringify({ args }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }));

          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setLoading(false);
        return [data.result, undefined];
      } catch (error) {
        setLoading(false);
        return [undefined, error instanceof Error ? error : new Error(String(error))];
      }
    },
    [path, apiUrl, headersEsque],
  );

  return { run, loading };
};
