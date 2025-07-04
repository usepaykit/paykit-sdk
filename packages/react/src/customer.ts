import { CreateCustomerParams, UpdateCustomerParams } from '@paykit-sdk/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePaykitContext } from './paykit';

export const useCustomer = ({ customerId }: { customerId: string }) => {
  const { provider } = usePaykitContext();

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['paykit', 'customer', customerId],
    queryFn: () => provider.retrieveCustomer(customerId),
    enabled: !!customerId,
  });

  const {
    mutateAsync: createCustomer,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: (params: CreateCustomerParams) => provider.createCustomer(params),
  });

  const {
    mutateAsync: updateCustomer,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateCustomerParams }) => provider.updateCustomer(id, params),
  });

  return {
    customer,
    isLoading,
    error,
    create: { mutate: createCustomer, isLoading: isCreating, error: createError },
    update: { mutate: updateCustomer, isLoading: isUpdating, error: updateError },
  };
};
