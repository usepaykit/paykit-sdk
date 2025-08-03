import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCheckout = () => {
  const { provider } = usePaykitContext();

  if (!provider) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const create = useAsyncFn(provider.createCheckout);
  const retrieve = useAsyncFn(provider.retrieveCheckout);

  return { create, retrieve };
};
