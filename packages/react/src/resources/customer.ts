import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCustomer = () => {
  const { provider } = usePaykitContext();

  const retrieve = useAsyncFn(provider.retrieveCustomer);
  const create = useAsyncFn(provider.createCustomer);
  const update = useAsyncFn(provider.updateCustomer);

  return { retrieve, create, update };
};
