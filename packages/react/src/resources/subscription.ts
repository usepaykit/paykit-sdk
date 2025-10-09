import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useSubscription = () => {
  const ctx = usePaykitContext();

  if (!ctx) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const create = useAsyncFn(ctx.provider.createSubscription);
  const update = useAsyncFn(ctx.provider.updateSubscription);
  const retrieve = useAsyncFn(ctx.provider.retrieveSubscription);
  const cancel = useAsyncFn(ctx.provider.cancelSubscription);
  const remove = useAsyncFn(ctx.provider.deleteSubscription);

  return { create, update, retrieve, cancel, remove };
};
