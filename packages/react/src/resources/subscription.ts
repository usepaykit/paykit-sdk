import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useSubscription = () => {
  const { provider } = usePaykitContext();

  const retrieve = useAsyncFn(provider.retrieveSubscription);
  const update = useAsyncFn(provider.updateSubscription);
  const cancel = useAsyncFn(provider.cancelSubscription);

  return { retrieve, update, cancel };
};
