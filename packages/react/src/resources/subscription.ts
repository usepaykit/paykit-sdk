import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useSubscription = () => {
  const ctx = usePaykitContext();

  if (!ctx) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const retrieve = useAsyncFn(ctx.provider.retrieveSubscription);
  const update = useAsyncFn(ctx.provider.updateSubscription);
  const cancel = useAsyncFn(ctx.provider.cancelSubscription);

  return { retrieve, update, cancel };
};
