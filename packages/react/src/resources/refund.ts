import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useRefund = () => {
  const ctx = usePaykitContext();

  if (!ctx) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const create = useAsyncFn(ctx.provider.createRefund);

  return { create };
};
