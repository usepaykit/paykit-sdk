import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCheckout = () => {
  const ctx = usePaykitContext();

  if (!ctx) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const create = useAsyncFn(ctx.provider.createCheckout);
  const retrieve = useAsyncFn(ctx.provider.retrieveCheckout);

  return { create, retrieve };
};
