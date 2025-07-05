import * as React from 'react';
import { tryCatchAsync } from '@paykit-sdk/core';

export const useAsyncFn = <Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<R | null>(null);

  const run = React.useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      setData(null);
      const [result, error] = await tryCatchAsync(fn(...args));
      if (result) setData(result);
      if (error) setError(error);
      setLoading(false);
    },
    [fn],
  );

  return { run, loading, error, data };
};
