import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCustomer = () => {
  const { provider } = usePaykitContext();

  if (!provider) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const retrieve = useAsyncFn(provider.retrieveCustomer);
  const create = useAsyncFn(provider.createCustomer);
  const update = useAsyncFn(provider.updateCustomer);

  return { retrieve, create, update };
};
