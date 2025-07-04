import { CreateCheckoutParams } from '@paykit-sdk/core';
import { useMutation } from '@tanstack/react-query';
import { usePaykitContext } from './paykit';

export const useCheckout = () => {
  const { provider } = usePaykitContext();

  const {
    mutateAsync: createCheckout,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: (params: CreateCheckoutParams) => provider.createCheckout(params),
  });

  const {
    mutateAsync: retrieveCheckout,
    isPending: isRetrieving,
    error: retrieveError,
  } = useMutation({
    mutationFn: (checkoutId: string) => provider.retrieveCheckout(checkoutId),
  });

  return {
    create: { mutate: createCheckout, isLoading: isCreating, error: createError },
    retrieve: { mutate: retrieveCheckout, isLoading: isRetrieving, error: retrieveError },
  };
};
