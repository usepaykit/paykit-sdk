import * as React from 'react';
import { tryCatchAsync } from '@paykit-sdk/core';

export const useAsyncFn = <Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) => {
  const [loading, setLoading] = React.useState(false);

  const run = React.useCallback(
    async (...args: Args) => {
      setLoading(true);
      const [data, error] = await tryCatchAsync(fn(...args));
      setLoading(false);
      return { data, error };
    },
    [fn],
  );

  return { run, loading };
};
