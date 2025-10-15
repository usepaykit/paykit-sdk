import { EndpointArgs, EndpointReturn } from '@paykit-sdk/core';
import { usePaykitContext } from '../context';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useSubscription = () => {
  const ctx = usePaykitContext();

  const create = useAsyncFn<EndpointArgs<'/subscription/create'>, EndpointReturn<'/subscription/create'>>(
    '/subscription/create',
    ctx.apiUrl,
    ctx.headers,
  );

  const update = useAsyncFn<EndpointArgs<'/subscription/update'>, EndpointReturn<'/subscription/update'>>(
    '/subscription/update',
    ctx.apiUrl,
    ctx.headers,
  );

  const retrieve = useAsyncFn<EndpointArgs<'/subscription/retrieve'>, EndpointReturn<'/subscription/retrieve'>>(
    '/subscription/retrieve',
    ctx.apiUrl,
    ctx.headers,
  );

  const cancel = useAsyncFn<EndpointArgs<'/subscription/cancel'>, EndpointReturn<'/subscription/cancel'>>(
    '/subscription/cancel',
    ctx.apiUrl,
    ctx.headers,
  );

  const remove = useAsyncFn<EndpointArgs<'/subscription/delete'>, EndpointReturn<'/subscription/delete'>>(
    '/subscription/delete',
    ctx.apiUrl,
    ctx.headers,
  );

  return { create, update, retrieve, cancel, remove };
};
