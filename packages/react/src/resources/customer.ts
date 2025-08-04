import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCustomer = () => {
  const ctx = usePaykitContext();

  if (!ctx) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const retrieve = useAsyncFn(ctx.provider.retrieveCustomer);
  const create = useAsyncFn(ctx.provider.createCustomer);
  const update = useAsyncFn(ctx.provider.updateCustomer);

  return { retrieve, create, update };
};
