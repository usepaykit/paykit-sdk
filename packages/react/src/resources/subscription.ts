import { usePaykitContext } from '../core';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useSubscription = () => {
  const { provider } = usePaykitContext();

  if (!provider) {
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');
  }

  const retrieve = useAsyncFn(provider.retrieveSubscription);
  const update = useAsyncFn(provider.updateSubscription);
  const cancel = useAsyncFn(provider.cancelSubscription);

  return { retrieve, update, cancel };
};
