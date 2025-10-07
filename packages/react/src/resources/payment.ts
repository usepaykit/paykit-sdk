import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const usePayment = () => {
  const ctx = usePaykitContext();

  if (!ctx) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const create = useAsyncFn(ctx.provider.createPayment);
  const retrieve = useAsyncFn(ctx.provider.retrievePayment);
  const update = useAsyncFn(ctx.provider.updatePayment);
  const remove = useAsyncFn(ctx.provider.deletePayment);

  return { create, retrieve, update, remove };
};
