import { EndpointArgs, EndpointReturn } from '@paykit-sdk/core';
import { usePaykitContext } from '../context';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useRefund = () => {
  const ctx = usePaykitContext();

  const create = useAsyncFn<EndpointArgs<'/refund/create'>, EndpointReturn<'/refund/create'>>(
    '/refund/create',
    ctx.apiUrl,
    ctx.headers,
  );

  return { create };
};
