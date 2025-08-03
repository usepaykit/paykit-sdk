import * as React from 'react';
import { tryCatchAsync } from '@paykit-sdk/core';

type AsyncResult<T> = [data: T, error: undefined] | [data: undefined, error: Error];

export const useAsyncFn = <Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) => {
  const [loading, setLoading] = React.useState(false);

  const run = React.useCallback(
    async (...args: Args): Promise<AsyncResult<R>> => {
      setLoading(true);
      const [data, error] = await tryCatchAsync(fn(...args));
      setLoading(false);

      if (error) {
        return [undefined, error];
      }

      return [data, undefined];
    },
    [fn],
  );

  return { run, loading };
};
