import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCheckout = () => {
  const { provider } = usePaykitContext();

  const create = useAsyncFn(provider.createCheckout);
  const retrieve = useAsyncFn(provider.retrieveCheckout);

  return { create, retrieve };
};
